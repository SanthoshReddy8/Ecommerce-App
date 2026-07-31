import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { handleApiError } from "@/lib/api";
import { slugify } from "@/lib/format";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().min(1),
  stockQuantity: z.number().int().min(0),
  imageUrl: z.string().url().optional().or(z.literal("")),
  active: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = schema.parse(await request.json());
    const slug = slugify(body.name);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        stockQuantity: body.stockQuantity,
        imageUrl: body.imageUrl || null,
        active: body.active,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}
