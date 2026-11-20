// TEMPORARY — visual check of loading skeletons; delete after review.
import StoreLoading from "../shop/loading";
import ProductLoading from "../shop/[slug]/loading";
import AboutLoading from "../about/loading";
import LegalLoading from "../legal/[page]/loading";
import CartLoading from "../cart/loading";

export default function SkeletonPreview({ searchParams }: { searchParams: { s?: string } }) {
  const map: Record<string, () => JSX.Element> = {
    store: StoreLoading,
    product: ProductLoading,
    about: AboutLoading,
    legal: LegalLoading,
    cart: CartLoading,
  };
  const C = map[searchParams.s ?? "store"] ?? StoreLoading;
  return <C />;
}
