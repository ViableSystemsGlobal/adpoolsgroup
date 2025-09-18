import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/stock-movements - Get all stock movements with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const warehouseId = searchParams.get('warehouseId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const movements = await prisma.stockMovement.findMany({
      where,
      select: {
        id: true,
        type: true,
        quantity: true,
        reference: true,
        reason: true,
        notes: true,
        userId: true,
        createdAt: true,
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uomBase: true,
          }
        },
        stockItem: {
          select: {
            id: true,
            quantity: true,
            available: true,
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        fromWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        toWarehouse: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.stockMovement.count({ where });

    return NextResponse.json({
      movements,
      total,
      hasMore: offset + movements.length < total,
    });
  } catch (error) {
    console.error("Error fetching stock movements:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock movements" },
      { status: 500 }
    );
  }
}

// POST /api/stock-movements - Create a new stock movement
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const productId = formData.get('productId') as string;
    const type = formData.get('type') as string;
    const quantity = parseFloat(formData.get('quantity') as string);
    const unitCost = formData.get('unitCost') ? parseFloat(formData.get('unitCost') as string) : null;
    const reference = formData.get('reference') as string;
    const reason = formData.get('reason') as string;
    const notes = formData.get('notes') as string;
    const warehouseId = formData.get('warehouseId') as string;
    const grnFile = formData.get('grnFile') as File | null;
    const purchaseOrderFile = formData.get('purchaseOrderFile') as File | null;
    const transferDirection = formData.get('transferDirection') as string | null;
    const transferFromWarehouse = formData.get('transferFromWarehouse') as string | null;
    const transferToWarehouse = formData.get('transferToWarehouse') as string | null;
    const userId = formData.get('userId') as string | null;

    if (!productId || !type || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID, type, and quantity are required" },
        { status: 400 }
      );
    }

    // Get or create stock item for the specific warehouse
    let stockItem = await prisma.stockItem.findFirst({
      where: { 
        productId,
        warehouseId: warehouseId || null
      },
    });

    if (!stockItem) {
      stockItem = await prisma.stockItem.create({
        data: {
          productId,
          quantity: 0,
          reserved: 0,
          available: 0,
          averageCost: 0,
          totalValue: 0,
          warehouseId,
        },
      });
    }

    // Calculate total cost for this movement
    const totalCost = unitCost ? quantity * unitCost : null;

    // Map TRANSFER type to appropriate database enum based on direction
    let finalType = type;
    if (type === "TRANSFER" && transferDirection) {
      finalType = transferDirection === "OUT" ? "TRANSFER_OUT" : "TRANSFER_IN";
    }

    // Build notes with transfer information if applicable
    let finalNotes = notes;
    if (type === "TRANSFER" && transferDirection) {
      const transferInfo = transferDirection === "OUT" 
        ? `Transfer OUT to warehouse: ${transferToWarehouse}`
        : `Transfer IN from warehouse: ${transferFromWarehouse}`;
      finalNotes = notes ? `${notes}\n\n${transferInfo}` : transferInfo;
    }

    // Create the stock movement
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        stockItemId: stockItem.id,
        type: finalType as any,
        quantity,
        unitCost,
        totalCost,
        reference,
        reason,
        notes: finalNotes,
        userId: userId || null,
        warehouseId,
        fromWarehouseId: type === "TRANSFER" && transferDirection === "IN" ? transferFromWarehouse : null,
        toWarehouseId: type === "TRANSFER" && transferDirection === "OUT" ? transferToWarehouse : null,
      },
    });

    // For transfers, we need to handle both source and destination warehouses
    if (finalType === "TRANSFER_OUT" || finalType === "TRANSFER_IN") {
      if (transferDirection === "OUT") {
        // Transfer OUT: Remove from current warehouse
        const newQuantity = stockItem.quantity + quantity; // quantity is negative for OUT
        const newAvailable = Math.max(0, newQuantity - stockItem.reserved);
        
        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: {
            quantity: newQuantity,
            available: newAvailable,
            warehouseId,
          },
        });

        // Create corresponding TRANSFER_IN movement for destination warehouse
        if (transferToWarehouse) {
          // Get or create stock item for destination warehouse
          let destStockItem = await prisma.stockItem.findFirst({
            where: { 
              productId,
              warehouseId: transferToWarehouse
            },
          });

          if (!destStockItem) {
            destStockItem = await prisma.stockItem.create({
              data: {
                productId,
                quantity: 0,
                available: 0,
                reserved: 0,
                averageCost: 0,
                totalValue: 0,
                warehouseId: transferToWarehouse,
              },
            });
          }

          // Add stock to destination warehouse
          const destNewQuantity = destStockItem.quantity + Math.abs(quantity);
          const destNewAvailable = Math.max(0, destNewQuantity - destStockItem.reserved);

          await prisma.stockItem.update({
            where: { id: destStockItem.id },
            data: {
              quantity: destNewQuantity,
              available: destNewAvailable,
              warehouseId: transferToWarehouse,
            },
          });

          // Create TRANSFER_IN movement for destination warehouse
          await prisma.stockMovement.create({
            data: {
              productId,
              stockItemId: destStockItem.id,
              type: "TRANSFER_IN",
              quantity: Math.abs(quantity),
              unitCost,
              totalCost: unitCost ? Math.abs(quantity) * unitCost : null,
              reference,
              reason,
              notes: `Transfer IN from warehouse: ${warehouseId}`,
              userId: userId || null,
              warehouseId: transferToWarehouse,
              fromWarehouseId: warehouseId,
              toWarehouseId: transferToWarehouse,
            },
          });
        }
      } else {
        // Transfer IN: Add to current warehouse
        const newQuantity = stockItem.quantity + quantity; // quantity is positive for IN
        const newAvailable = Math.max(0, newQuantity - stockItem.reserved);
        
        // Calculate weighted average cost if this is a stock IN movement with unit cost
        let newAverageCost = stockItem.averageCost;
        if (quantity > 0 && unitCost && unitCost > 0) {
          const currentTotalCost = stockItem.quantity * stockItem.averageCost;
          const newTotalCost = quantity * unitCost;
          const combinedTotalCost = currentTotalCost + newTotalCost;
          newAverageCost = newQuantity > 0 ? combinedTotalCost / newQuantity : stockItem.averageCost;
        }
        
        // Calculate new total value using average cost (for cost value)
        const newTotalValue = newQuantity * newAverageCost;

        await prisma.stockItem.update({
          where: { id: stockItem.id },
          data: {
            quantity: newQuantity,
            available: newAvailable,
            averageCost: newAverageCost,
            totalValue: newTotalValue,
            warehouseId,
          },
        });

        // Create corresponding TRANSFER_OUT movement for source warehouse
        if (transferFromWarehouse) {
          // Get stock item for source warehouse
          const sourceStockItem = await prisma.stockItem.findFirst({
            where: { 
              productId,
              warehouseId: transferFromWarehouse
            },
          });

          if (sourceStockItem) {
            // Remove stock from source warehouse
            const sourceNewQuantity = sourceStockItem.quantity - quantity;
            const sourceNewAvailable = Math.max(0, sourceNewQuantity - sourceStockItem.reserved);

            await prisma.stockItem.update({
              where: { id: sourceStockItem.id },
              data: {
                quantity: sourceNewQuantity,
                available: sourceNewAvailable,
                warehouseId: transferFromWarehouse,
              },
            });

            // Create TRANSFER_OUT movement for source warehouse
            await prisma.stockMovement.create({
              data: {
                productId,
                stockItemId: sourceStockItem.id,
                type: "TRANSFER_OUT",
                quantity: -quantity,
                unitCost,
                totalCost: unitCost ? quantity * unitCost : null,
                reference,
                reason,
                notes: `Transfer OUT to warehouse: ${warehouseId}`,
                userId: userId || null,
                warehouseId: transferFromWarehouse,
              },
            });
          }
        }
      }
    } else {
      // Regular stock movement (non-transfer)
      // For RECEIPT, RETURN, and positive ADJUSTMENT: quantity is positive (stock in)
      // For SALE, DAMAGE, THEFT, EXPIRY, and negative ADJUSTMENT: quantity is negative (stock out)
      const newQuantity = stockItem.quantity + quantity;
      const newAvailable = Math.max(0, newQuantity - stockItem.reserved);
      
      // Calculate weighted average cost if this is a stock IN movement with unit cost
      let newAverageCost = stockItem.averageCost;
      if (quantity > 0 && unitCost && unitCost > 0) {
        const currentTotalCost = stockItem.quantity * stockItem.averageCost;
        const newTotalCost = quantity * unitCost;
        const combinedTotalCost = currentTotalCost + newTotalCost;
        newAverageCost = newQuantity > 0 ? combinedTotalCost / newQuantity : stockItem.averageCost;
      }
      
      // Calculate new total value using average cost (for cost value)
      const newTotalValue = newQuantity * newAverageCost;

      await prisma.stockItem.update({
        where: { id: stockItem.id },
        data: {
          quantity: newQuantity,
          available: newAvailable,
          averageCost: newAverageCost,
          totalValue: newTotalValue,
          warehouseId,
        },
      });
    }

    // Handle file uploads if they exist
    if (grnFile && grnFile.size > 0) {
      try {
        const grnBuffer = await grnFile.arrayBuffer();
        const grnPath = `uploads/stock-movements/${movement.id}/grn-${Date.now()}-${grnFile.name}`;
        
        // Create directory if it doesn't exist
        const fs = await import('fs/promises');
        const path = await import('path');
        const dir = path.dirname(grnPath);
        await fs.mkdir(dir, { recursive: true });
        
        // Save file
        await fs.writeFile(grnPath, Buffer.from(grnBuffer));
        
        // Update movement with GRN file path
        await prisma.stockMovement.update({
          where: { id: movement.id },
          data: { 
            notes: notes ? `${notes}\n\nGRN: ${grnPath}` : `GRN: ${grnPath}` 
          }
        });
      } catch (fileError) {
        console.error('Error saving GRN file:', fileError);
        // Don't fail the entire request if file save fails
      }
    }

    if (purchaseOrderFile && purchaseOrderFile.size > 0) {
      try {
        const poBuffer = await purchaseOrderFile.arrayBuffer();
        const poPath = `uploads/stock-movements/${movement.id}/po-${Date.now()}-${purchaseOrderFile.name}`;
        
        // Create directory if it doesn't exist
        const fs = await import('fs/promises');
        const path = await import('path');
        const dir = path.dirname(poPath);
        await fs.mkdir(dir, { recursive: true });
        
        // Save file
        await fs.writeFile(poPath, Buffer.from(poBuffer));
        
        // Update movement with PO file path
        await prisma.stockMovement.update({
          where: { id: movement.id },
          data: { 
            notes: notes ? `${notes}\n\nPO: ${poPath}` : `PO: ${poPath}` 
          }
        });
      } catch (fileError) {
        console.error('Error saving Purchase Order file:', fileError);
        // Don't fail the entire request if file save fails
      }
    }

    // Return the movement with product details
    const movementWithDetails = await prisma.stockMovement.findUnique({
      where: { id: movement.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            uomBase: true,
          }
        },
        stockItem: {
          select: {
            id: true,
            quantity: true,
            available: true,
          }
        }
      },
    });

    return NextResponse.json(movementWithDetails, { status: 201 });
  } catch (error) {
    console.error("Error creating stock movement:", error);
    return NextResponse.json(
      { error: "Failed to create stock movement" },
      { status: 500 }
    );
  }
}
