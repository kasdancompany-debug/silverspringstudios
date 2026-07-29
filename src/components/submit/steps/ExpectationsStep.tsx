"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { compactPartial, type StepHandle } from "@/components/submit/form-utils";
import { OptionalBadge, StepHeader, StepNav } from "@/components/submit/StepChrome";
import { expectationsSchema, type ExpectationsInput } from "@/lib/validations/submission";

const DEFAULTS: ExpectationsInput = {
  primary_release_goal: "",
  most_important_territory: "",
  existing_audience_size: "",
  mailing_list_size: "",
  social_following: "",
  marketing_participation: "",
  desired_release_timing: "",
  revenue_expectations: "",
  partnership_success: "",
  additional_context: "",
};

export interface ExpectationsStepProps {
  defaultValues?: Partial<ExpectationsInput>;
  onNext: (data: ExpectationsInput) => void;
  onBack: (values: Partial<ExpectationsInput>) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onValuesChange?: (values: Record<string, unknown>) => void;
}

export const ExpectationsStep = forwardRef<StepHandle, ExpectationsStepProps>(function ExpectationsStep(
  { defaultValues, onNext, onBack, onDirtyChange, onValuesChange },
  ref,
) {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<ExpectationsInput>({
    resolver: zodResolver(expectationsSchema),
    mode: "onBlur",
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });

  useImperativeHandle(ref, () => ({
    getSnapshot: () => compactPartial(getValues()) as Record<string, unknown>,
    isDirty: () => isDirty,
  }));

  useEffect(() => {
    const subscription = watch((values) => onValuesChange?.(values as Record<string, unknown>));
    return () => subscription.unsubscribe();
  }, [watch, onValuesChange]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  return (
    <motion.form
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onSubmit={handleSubmit(onNext)}
      className="space-y-8"
      noValidate
    >
      <StepHeader
        step={5}
        title="Release expectations"
        description="This section helps us understand what success would look like for you. It does not represent an offer, and Silver Spring Studios cannot guarantee any release outcome, marketing plan or revenue figure."
        estimate="About 9 fields — most are optional"
      />

      <Textarea
        label="Primary release goal"
        required
        rows={2}
        hint="e.g. Widest possible audience, festival prestige, a specific platform"
        error={errors.primary_release_goal?.message}
        {...register("primary_release_goal")}
      />

      <Input
        label="Most important territory"
        required
        error={errors.most_important_territory?.message}
        {...register("most_important_territory")}
      />

      <div className="space-y-2 border border-line-strong bg-surface px-4 py-4 text-xs leading-relaxed text-slate">
        The fields below about your existing audience are optional — leave any of them blank if
        they don&apos;t apply or you&apos;d rather not share.
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label={<>Existing audience size <OptionalBadge /></>}
          hint="Rough estimate is fine"
          error={errors.existing_audience_size?.message}
          {...register("existing_audience_size")}
        />
        <Input
          label={<>Mailing list size <OptionalBadge /></>}
          error={errors.mailing_list_size?.message}
          {...register("mailing_list_size")}
        />
      </div>

      <Input
        label={<>Social following <OptionalBadge /></>}
        hint="e.g. Instagram 12k, TikTok 4k"
        error={errors.social_following?.message}
        {...register("social_following")}
      />

      <Textarea
        label="Marketing participation"
        required
        rows={3}
        hint="How would you be able to support marketing and promotion of the release?"
        error={errors.marketing_participation?.message}
        {...register("marketing_participation")}
      />

      <Input
        label="Desired release timing"
        required
        hint="e.g. As soon as possible, aligned to a festival run, specific date"
        error={errors.desired_release_timing?.message}
        {...register("desired_release_timing")}
      />

      <Textarea
        label={<>Revenue expectations <OptionalBadge /></>}
        rows={2}
        hint="Silver Spring Studios does not guarantee any revenue outcome — this is for context only."
        error={errors.revenue_expectations?.message}
        {...register("revenue_expectations")}
      />

      <Textarea
        label="What would make this partnership feel successful to you?"
        required
        rows={3}
        error={errors.partnership_success?.message}
        {...register("partnership_success")}
      />

      <Textarea
        label={<>Anything else we should know? <OptionalBadge /></>}
        rows={3}
        error={errors.additional_context?.message}
        {...register("additional_context")}
      />

      <StepNav onBack={() => onBack(getValues())} continueLabel="Continue to review" />
    </motion.form>
  );
});
