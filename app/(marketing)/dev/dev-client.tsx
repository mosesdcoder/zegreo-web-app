"use client";

import { useState } from "react";
import { PaymentMethodPicker } from "@/components/brand/payment-method-picker";
import { DocRow } from "@/components/brand/doc-row";
import type { PaymentMethod } from "@/lib/types";

export function DevPaymentPicker() {
  const [method, setMethod] = useState<PaymentMethod>("MPESA");
  return <PaymentMethodPicker value={method} onChange={setMethod} />;
}

export function DevDocRows() {
  return (
    <div className="space-y-2">
      <DocRow doc={{ id: "1", applicationId: "a1", type: "NATIONAL_ID", label: "National ID", status: "VERIFIED", isMandatory: true, uploadedAt: "2024-01-11T10:00:00Z" }} />
      <DocRow doc={{ id: "2", applicationId: "a1", type: "PASSPORT_PHOTO", label: "Passport Photo", status: "PENDING", isMandatory: true, uploadedAt: "2024-01-12T10:00:00Z" }} />
      <DocRow doc={{ id: "3", applicationId: "a1", type: "KCSE_CERTIFICATE", label: "KCSE Certificate", status: "REJECTED", rejectionReason: "Document is blurry, please re-upload a clearer copy.", isMandatory: true }} onUpload={() => {}} />
      <DocRow doc={{ id: "4", applicationId: "a1", type: "BIRTH_CERTIFICATE", label: "Birth Certificate", status: "NOT_UPLOADED", isMandatory: false }} onUpload={() => {}} />
    </div>
  );
}
