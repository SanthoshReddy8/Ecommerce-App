import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { handleApiError } from "@/lib/api";
import { slugify } from "@/lib/format";
import { prisma } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().int().min(1).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")).nullable(),
  active: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = schema.parse(await request.json());

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...body,
        ...(body.name ? { slug: slugify(body.name) } : {}),
        imageUrl: body.imageUrl === "" ? null : body.imageUrl,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
