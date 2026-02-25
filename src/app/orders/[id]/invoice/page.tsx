import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import InvoiceClient from "./InvoiceClient";

export const metadata = {
  title: "Invoice | Sai Nandhini",
};

export default async function InvoicePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const format =
    typeof searchParams.format === "string" ? searchParams.format : "a4";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?callbackUrl=/orders/" + id + "/invoice");
  }

  await connectDB();
  const order = await Order.findById(id).populate({
    path: "orderItems.product",
    select: "slug name",
  });

  if (
    !order ||
    (order.user.toString() !== session.user.id &&
      (session.user as any).role !== "admin")
  ) {
    return (
      <div className="p-10 text-center font-bold text-red-500">
        Order not found or unauthorized
      </div>
    );
  }

  return (
    <InvoiceClient order={JSON.parse(JSON.stringify(order))} format={format} />
  );
}
