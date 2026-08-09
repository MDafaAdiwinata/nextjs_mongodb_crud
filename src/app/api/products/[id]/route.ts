import { NextResponse } from "next/server";
import connectDb from "../../../../../lib/db";
import Product from "../../../../../models/Product";

// Update product
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDb();
        const body = await req.json();
        const product = await Product.findByIdAndUpdate(params.id, body, { new: true, })

        if (!product) return NextResponse.json({ error: "Product not found!" })

        return NextResponse.json({
            success: true,
            data: product,
        })
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            {
                status: 400,
            }
        )
    }
}

// for delete Product
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await connectDb();
        const product = await Product.findByIdAndDelete(params.id);

        if (!product) return NextResponse.json({ error: "Product not found!" });

        return NextResponse.json(
            {
                success: true,
                message: "Product deleted!",
            }
        )
    } catch (error: any) {
        return NextResponse.json(
            {
                succecs: false,
                error: error.message,
            },
            {
                status: 400,
            }
        )
    }
}