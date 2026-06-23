import React from "react";
import {
  CheckCircle,
  CreditCard,
  Crown,
  Receipt,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { c, FONT, MONO } from "../../styles/theme";
import { Card } from "../components/ui/card";

export default function BillingPage() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      tag: "Current Plan",
      features: [
        "50 AI screenings/month",
        "5 active job posts",
        "Basic analytics",
        "Skill gap analysis",
      ],
    },
    {
      name: "Professional",
      price: "₹799/mo",
      tag: "Recommended",
      features: [
        "Unlimited screenings",
        "Advanced AI insights",
        "Bulk resume upload",
        "Export reports",
      ],
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div
        className="rounded-3xl p-5 sm:p-7 overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, rgba(245,185,66,0.16), rgba(17,24,39,0.95))",
          border: `1px solid ${c.border}`,
        }}
      >
        <div className="relative z-10">
          <p
            className="text-xs uppercase tracking-[0.25em] font-semibold"
            style={{ color: c.amber, fontFamily: MONO }}
          >
            Billing
          </p>

          <h1
            className="mt-2 text-2xl sm:text-3xl font-bold"
            style={{ color: c.text, fontFamily: FONT }}
          >
            Plans & AI Credits
          </h1>

          <p
            className="mt-2 max-w-2xl text-sm"
            style={{ color: c.textDim, fontFamily: FONT }}
          >
            Manage your ResumeAI subscription, usage limits, and billing
            history.
          </p>
        </div>

        <Sparkles
          size={90}
          className="absolute -right-4 -bottom-5 opacity-20"
          style={{ color: c.amber }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: "Current Plan",
            value: "Starter",
            sub: "Free plan active",
            icon: <CreditCard size={18} />,
          },
          {
            label: "Next Billing",
            value: "₹0",
            sub: "No payment due",
            icon: <Receipt size={18} />,
          },
        ].map((item) => (
          <Card key={item.label} className="p-4 sm:p-5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: c.amberDim, color: c.amber }}
            >
              {item.icon}
            </div>

            <p
              className="mt-4 text-xs"
              style={{ color: c.textDim, fontFamily: FONT }}
            >
              {item.label}
            </p>

            <h3
              className="mt-1 text-xl font-bold"
              style={{ color: c.text, fontFamily: MONO }}
            >
              {item.value}
            </h3>

            <p
              className="mt-1 text-xs"
              style={{ color: c.textDim, fontFamily: FONT }}
            >
              {item.sub}
            </p>
          </Card>
        ))}
      </div>

      {/* Usage */}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2
              className="text-lg font-bold"
              style={{ color: c.text, fontFamily: FONT }}
            >
              Monthly Usage
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: c.textDim, fontFamily: FONT }}
            >
              Track your AI resume screening limits.
            </p>
          </div>

          <span
            className="w-fit rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: c.emeraldDim, color: c.emerald }}
          >
            Active
          </span>
        </div>


      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className="p-5 sm:p-6 relative overflow-hidden"
            style={{
              borderColor: plan.highlight ? c.amber : c.border,
              background: plan.highlight
                ? "linear-gradient(145deg, rgba(245,185,66,0.12), rgba(17,24,39,0.96))"
                : c.surface,
            }}
          >
            {plan.highlight && (
              <div
                className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ background: c.amberDim, color: c.amber }}
              >
                Best Value
              </div>
            )}

            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: c.amberDim, color: c.amber }}
            >
              {plan.highlight ? <Crown size={20} /> : <CreditCard size={20} />}
            </div>

            <p
              className="mt-5 text-xs uppercase tracking-widest"
              style={{ color: c.textDim, fontFamily: MONO }}
            >
              {plan.tag}
            </p>

            <h3
              className="mt-1 text-2xl font-bold"
              style={{ color: c.text, fontFamily: FONT }}
            >
              {plan.name}
            </h3>

            <p
              className="mt-2 text-3xl font-bold"
              style={{ color: c.amber, fontFamily: MONO }}
            >
              {plan.price}
            </p>

            <div className="mt-5 space-y-3">
              {plan.features.map((feature) => (
                <p
                  key={feature}
                  className="flex items-center gap-2 text-sm"
                  style={{ color: c.textDim, fontFamily: FONT }}
                >
                  <CheckCircle size={15} style={{ color: c.emerald }} />
                  {feature}
                </p>
              ))}
            </div>

            <button
              className="mt-6 w-full rounded-xl py-2.5 text-sm font-semibold"
              style={{
                background: plan.highlight ? c.amber : "rgba(255,255,255,0.06)",
                color: plan.highlight ? "#000" : c.text,
                border: `1px solid ${plan.highlight ? c.amber : c.border}`,
              }}
            >
              {plan.highlight ? "Upgrade Plan" : "Current Plan"}
            </button>
          </Card>
        ))}
      </div>

      {/* Billing History */}
      <Card className="p-5 sm:p-6">
        <h2
          className="text-lg font-bold flex items-center gap-2"
          style={{ color: c.text, fontFamily: FONT }}
        >
          <Receipt size={18} />
          Billing History
        </h2>

        <div
          className="mt-4 rounded-2xl p-4 text-sm"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${c.border}`,
            color: c.textDim,
            fontFamily: FONT,
          }}
        >
          No billing history yet. You are currently using the Starter Free plan.
        </div>
      </Card>
    </div>
  );
}