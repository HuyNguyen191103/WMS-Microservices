"use client";

import { useState } from "react";
import { showRequestError } from "@/lib/request-error";

export function useAsyncAction() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function run(action: () => Promise<void>, errorTitle: string) {
    setIsSubmitting(true);
    try {
      await action();
      return true;
    } catch (error) {
      showRequestError(errorTitle, error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isSubmitting, run };
}
