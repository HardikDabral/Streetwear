import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectToMongoDB from "@/libs/connectMongo";
import Product from "@/libs/Models/Product";
import ProductGallery from "@/app/components/Product/ProductGallery";
import ProductActions from "@/app/components/Product/ProductActions";
import RelatedProducts from "@/app/components/Product/RelatedProducts";
import { formatPrice } from "@/app/lib/format";
import { ChevronRight } from "@/app/components/ui/Icons";

const getProduct = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  await connectToMongoDB();
  const product = await Product.findById(id).lean();
  if (!product) return null;
  return { ...product, _id: String(product._id) };
};

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} — Karmic Vision`,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="bg-black text-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-white/50 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <ChevronRight width={12} height={12} />
          <Link href="/shop" className="hover:text-white">Shop</Link>
          {product.category && (
            <>
              <ChevronRight width={12} height={12} />
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="hover:text-white"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight width={12} height={12} />
          <span className="text-white truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ProductGallery images={product.imgSrc || []} alt={product.name} />

          {/* Details */}
          <div className="lg:pt-4">
            {product.category && (
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold tracking-wider uppercase mb-3">
                {product.category}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-2xl md:text-3xl font-extrabold text-white mb-6">
              {formatPrice(product.price)}
            </p>

            {product.description && (
              <p className="text-white/70 leading-relaxed mb-8 whitespace-pre-line">
                {product.description}
              </p>
            )}

            <ProductActions product={product} />

            {/* Trust info */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-xs text-white/60">
              <div>
                <p className="font-bold text-white mb-1">Free shipping</p>
                <p>On orders over ₹2,000</p>
              </div>
              <div>
                <p className="font-bold text-white mb-1">Easy exchange</p>
                <p>14-day exchange policy</p>
              </div>
              <div>
                <p className="font-bold text-white mb-1">Authentic</p>
                <p>100% genuine Karmic Vision</p>
              </div>
            </div>
          </div>
        </div>

        <RelatedProducts category={product.category} excludeId={product._id} />
      </div>
    </div>
  );
}
