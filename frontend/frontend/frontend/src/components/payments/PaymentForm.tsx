import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { createPayment } from "../../api/payments";
import { getStudentFees, type StudentFee } from "../../api/studentFees";

import ModuleModal from "../common/ModuleModal";
import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";

import { QRCodeSVG } from "qrcode.react";

const SCHOOL_UPI_ID = "9601023390@fam";
const SCHOOL_NAME = "School Management";

interface PaymentFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentForm({
  onClose,
  onSuccess,
}: PaymentFormProps) {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [feeId, setFeeId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getStudentFees()
      .then(setFees)
      .catch((e: any) =>
        setError(
          e?.response?.data?.detail ?? "Unable to load student fees."
        )
      );
  }, []);

  const selected = useMemo(
    () => fees.find((x) => x.id === Number(feeId)),
    [fees, feeId]
  );

  const remaining = selected
    ? Number(selected.amount_due) - Number(selected.amount_paid)
    : 0;

  const paymentAmount = Number(amount);

  /*
   * UPI QR data.
   *
   * Example:
   * upi://pay?pa=9601023390@fam&pn=School%20Management&am=500&cu=INR
   */
  const upiQrValue = useMemo(() => {
    if (method !== "UPI" || !amount || paymentAmount <= 0) {
      return "";
    }

    const params = new URLSearchParams({
      pa: SCHOOL_UPI_ID,
      pn: SCHOOL_NAME,
      am: paymentAmount.toFixed(2),
      cu: "INR",
    });

    if (receipt.trim()) {
      params.set("tn", `Fee Payment ${receipt.trim()}`);
    }

    return `upi://pay?${params.toString()}`;
  }, [method, amount, paymentAmount, receipt]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (!feeId || !amount || !receipt.trim()) {
      setError(
        "Student fee, amount and receipt number are required."
      );
      return;
    }

    const value = Number(amount);

    if (!Number.isFinite(value) || value <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    if (value > remaining) {
      setError(
        `Payment must be greater than 0 and no more than ₹${remaining.toFixed(
          2
        )}.`
      );
      return;
    }

    try {
      setSaving(true);

      await createPayment({
        student_fee_id: Number(feeId),
        amount: value,
        method,
        receipt_no: receipt.trim(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ?? "Unable to record payment."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal title="Record Payment" onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        {error && <ErrorBox message={error} />}

        {/* Student Fee */}
        <Field label="Student Fee" required>
          <select
            className={inputClass}
            value={feeId}
            onChange={(e) => setFeeId(e.target.value)}
          >
            <option value="">Select fee</option>

            {fees
              .filter(
                (f) =>
                  Number(f.amount_paid) < Number(f.amount_due)
              )
              .map((f) => (
                <option key={f.id} value={f.id}>
                  Fee #{f.id} — Due ₹
                  {Number(f.amount_due).toLocaleString()} — Paid ₹
                  {Number(f.amount_paid).toLocaleString()}
                </option>
              ))}
          </select>
        </Field>

        {/* Remaining amount */}
        {selected && (
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            Remaining:{" "}
            <strong>₹{remaining.toLocaleString()}</strong>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Amount */}
          <Field label="Amount" required>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={remaining > 0 ? remaining : undefined}
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </Field>

          {/* Method */}
          <Field label="Method" required>
            <select
              className={inputClass}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {[
                "CASH",
                "UPI",
                "CARD",
                "BANK_TRANSFER",
                "CHEQUE",
              ].map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
          </Field>

          {/* Receipt */}
          <Field label="Receipt Number" required>
            <input
              className={inputClass}
              value={receipt}
              onChange={(e) => setReceipt(e.target.value)}
              placeholder="REC-0001"
            />
          </Field>
        </div>

        {/* UPI QR */}
        {method === "UPI" &&
          paymentAmount > 0 &&
          paymentAmount <= remaining && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-center">
                <h3 className="text-base font-semibold text-slate-900">
                  Scan to Pay
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Scan this QR code using any UPI app
                </p>

                <div className="mt-4 flex justify-center">
                  <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <QRCodeSVG
                      value={upiQrValue}
                      size={220}
                      level="M"
                      includeMargin
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-1 text-sm">
                  <p className="font-medium text-slate-900">
                    ₹{paymentAmount.toLocaleString()}
                  </p>

                  <p className="text-slate-500">
                    UPI ID: {SCHOOL_UPI_ID}
                  </p>

                  {receipt.trim() && (
                    <p className="text-slate-500">
                      Reference: {receipt.trim()}
                    </p>
                  )}
                </div>

                <div className="mt-4 rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-800">
                  After the UPI payment is successfully completed,
                  verify the payment and then click{" "}
                  <strong>Record Payment</strong>.
                </div>
              </div>
            </div>
          )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 hover:bg-slate-100"
          >
            Cancel
          </button>

          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Record Payment"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}