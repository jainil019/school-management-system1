import {
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  Receipt,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getMyChildren,
  type ParentChild,
} from "../../api/parentChildren";

import {
  getChildFees,
  getChildPayments,
  type ParentFee,
  type ParentPayment,
} from "../../api/parentFees";

function ParentFees() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [children, setChildren] = useState<ParentChild[]>([]);
  const [fees, setFees] = useState<ParentFee[]>([]);
  const [payments, setPayments] = useState<ParentPayment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedStudentId = Number(studentId);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const childData = await getMyChildren();

        setChildren(childData);

        const child = childData.find(
          (item) => item.student_id === selectedStudentId
        );

        if (!child) {
          setError(
            "You are not authorized to view this student's fees."
          );
          return;
        }

        const [feeData, paymentData] =
          await Promise.all([
            getChildFees(selectedStudentId),
            getChildPayments(selectedStudentId),
          ]);

        setFees(feeData);
        setPayments(paymentData);
      } catch (err) {
        console.error(
          "Failed to load child fees:",
          err
        );

        setError(
          "Failed to load fee information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      Number.isInteger(selectedStudentId) &&
      selectedStudentId > 0
    ) {
      void loadData();
    } else {
      setLoading(false);
      setError("Invalid student.");
    }
  }, [selectedStudentId]);

  const selectedChild = children.find(
    (child) =>
      child.student_id === selectedStudentId
  );

  const statistics = useMemo(() => {
    const totalDue = fees.reduce(
      (sum, fee) => sum + fee.amount_due,
      0
    );

    const totalPaid = fees.reduce(
      (sum, fee) => sum + fee.amount_paid,
      0
    );

    const totalPending = fees.reduce(
      (sum, fee) => sum + fee.amount_pending,
      0
    );

    return {
      totalDue,
      totalPaid,
      totalPending,
    };
  }, [fees]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (
    value: string | null
  ) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700";

      case "PARTIAL":
        return "bg-amber-50 text-amber-700";

      case "OVERDUE":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">
            Loading fees...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-indigo-600" />

              <span className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Parent Portal
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Fees
            </h1>

            <p className="mt-1 text-slate-500">
              View your child's fee details and payment history.
            </p>
          </div>

          {children.length > 0 && (
            <select
              value={
                selectedChild
                  ? selectedChild.student_id
                  : ""
              }
              onChange={(event) => {
                navigate(
                  `/parent/fees/${event.target.value}`
                );
              }}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              {children.map((child) => (
                <option
                  key={child.student_id}
                  value={child.student_id}
                >
                  {child.first_name}{" "}
                  {child.last_name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Child Information */}
      {selectedChild && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                {selectedChild.first_name}{" "}
                {selectedChild.last_name}
              </h2>

              <p className="text-sm text-slate-500">
                Admission No:{" "}
                {selectedChild.admission_no}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Fee
            </span>

            <DollarSign className="h-5 w-5 text-indigo-600" />
          </div>

          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(
              statistics.totalDue
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Paid
            </span>

            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>

          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(
              statistics.totalPaid
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Total Pending
            </span>

            <XCircle className="h-5 w-5 text-red-600" />
          </div>

          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(
              statistics.totalPending
            )}
          </p>
        </div>
      </div>

      {/* Fee Details */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-indigo-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Fee Details
              </h2>

              <p className="text-sm text-slate-500">
                Assigned fees and current payment status.
              </p>
            </div>
          </div>
        </div>

        {fees.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <h3 className="font-semibold text-slate-900">
              No fees found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No fees have been assigned to this student.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">
                    Fee Type
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Due Date
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Amount Due
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Paid
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Pending
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {fees.map((fee) => (
                  <tr
                    key={fee.student_fee_id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {fee.fee_type}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(
                        fee.due_date
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatCurrency(
                        fee.amount_due
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium text-emerald-600">
                      {formatCurrency(
                        fee.amount_paid
                      )}
                    </td>

                    <td className="px-6 py-4 font-medium text-red-600">
                      {formatCurrency(
                        fee.amount_pending
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          fee.status
                        )}`}
                      >
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-indigo-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Payment History
              </h2>

              <p className="text-sm text-slate-500">
                Previous payments and receipt information.
              </p>
            </div>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="p-10 text-center">
            <CreditCard className="mx-auto mb-4 h-12 w-12 text-slate-300" />

            <h3 className="font-semibold text-slate-900">
              No payments found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No payments have been recorded for this student.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">
                    Receipt No.
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Date
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Amount
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Method
                  </th>

                  <th className="px-6 py-4 font-semibold">
                    Fee ID
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-indigo-600" />

                        <span className="font-semibold text-slate-900">
                          {payment.receipt_no}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(
                        payment.paid_at
                      )}
                    </td>

                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {formatCurrency(
                        payment.amount
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {payment.method}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      #{payment.student_fee_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParentFees;