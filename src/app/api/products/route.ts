import { NextResponse } from "next/server";
import connectDb from "../../../../lib/db";
import Product from "../../../../models/Product";

// get all data products
export async function GET() {
    try {
        await connectDb();
        const products = await Product.find().sort({ createdAt: -1 });
        return NextResponse.json({
            success: true,
            data: products,
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            {
                status: 500,
            }
        )
    }
}

// Create new product
export async function POST(req: Request) {
    try {
        await connectDb();
        const body = await req.json();
        const product = await Product.create(body);
        return NextResponse.json(
            {
                success: true,
                data: product,
            },
            {
                status: 201,
            }
        )
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            {
                status: 400
            }
        )
    }
}