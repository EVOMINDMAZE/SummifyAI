```typescript
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } => (
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        /month
                      </span>
                    )}
                    </div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {plan.subtitle}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePlanChange(plan.id)}
                    disabled={isCurrentPlan}
                    className={\`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                      isPopular
                        ? "bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] shadow-lg hover:shadow-xl"
                        : plan.id === "free"
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                          : "bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-white shadow-lg hover:shadow-xl"
                    } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isCurrentPlan ? "Current Plan" : plan.cta}
                  </Button>

                  {plan.trial && !isCurrentPlan && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                      14-day free trial included
                    </p>
                  )}

                  {plan.customPricing && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                      Custom pricing available
                    </p>
                  )}

                  {plan.id === "free" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                      No credit card required
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```