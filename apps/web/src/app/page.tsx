import { StatsCards } from "@/components/StatsCards";
import InvoiceVolumeChart from "@/components/InvoiceVolumeChart";
import { SpendByVendor } from "@/components/SpendByVendor";
import { SpendByCategory } from "@/components/SpendByCategory";
import { CashOutflowForecast } from "@/components/CashOutflowForecast";
import { InvoicesByVendor } from "@/components/InvoicesByVendor";
import ChatWidget from "@/components/ChatWidget";

export default function Page() {
  return (
    <div className="max-w-[1400px] mx-auto">
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <InvoiceVolumeChart />
        <SpendByVendor />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mt-6 items-stretch">
        <div className="lg:col-span-3 flex">
          <SpendByCategory />
        </div>

        <div className="lg:col-span-3 flex">
          <CashOutflowForecast />
        </div>

        <div className="lg:col-span-4 flex">
          <InvoicesByVendor />
        </div>
      </div>
      <ChatWidget apiPath="/chat" />
    </div>
  );
}
