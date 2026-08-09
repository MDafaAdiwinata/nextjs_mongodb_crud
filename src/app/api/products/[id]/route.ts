import { NextResponse } from "next/server";
import connectDb from "../../../../../lib/db";
import Product from "../../../../../models/Product";

// UPDATE Product
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        await connectDb();
        const { id } = await params;
        const body = await req.json();

        const product = await Product.findByIdAndUpdate(id, body, { new: true });

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: product }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// DELETE Product
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    try {
        await connectDb();
        const { id } = await params;

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Product deleted" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}