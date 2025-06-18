"use client";

import { useState } from "react";
import { CashierSelector } from "@/components/Cashier/CashierSelector";
import CashierProfitList from "@/components/Profits/CashierProfitList";

export default function ProfitList() {
  const [selectedCashierId, setSelectedCashierId] = useState<string | null>(
    null
  );

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Profit Tracker</h1>

      <CashierSelector
        selectedCashierId={selectedCashierId}
        onCashierSelect={setSelectedCashierId}
      />

      {selectedCashierId && <CashierProfitList cashierId={selectedCashierId} />}
    </div>
  );
}
