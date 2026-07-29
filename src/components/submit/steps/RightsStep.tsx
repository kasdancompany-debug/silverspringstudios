"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { compactPartial, type StepHandle } from "@/components/submit/form-utils";
import { OptionalBadge, RequiredMark, StepHeader, StepNav } from "@/components/submit/StepChrome";
import { rightsSchema, type RightsInput } from "@/lib/validations/submission";

const DEFAULTS: RightsInput = {
  controls_rights: undefined as unknown as boolean,
  available_territories: "",
  rights_available: "",
  existing_agreements: "",
  previous_distributor: "",
  platform_availability: "",
  current_sales_agent: "",
  music_clearance_status: "",
  chain_of_title_status: "",
  union_guild_obligations: "",
  existing_debts_liens: "",
  rights_available_date: "",
};

export interface RightsStepProps {
  defaultValues?: Partial<RightsInput>;
  onNext: (data: RightsInput) => void;
  onBack: (values: Partial<RightsInput>) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onValuesChange?: (values: Record<string, unknown>) => void;
}

export const RightsStep = forwardRef<StepHandle, RightsStepProps>(function RightsStep(
  { defaultValues, onNext, onBack, onDirtyChange, onValuesChange },
  ref,
) {
  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<RightsInput>({
    resolver: zodResolver(rightsSchema),
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
        step={3}
        title="Rights & clearances"
        description="Help us understand what you control and what remains to be cleared. This does not commit either party to a deal — it lets us evaluate feasibility."
        estimate="About 10 fields"
      />

      <div className="space-y-3">
        <p className="block text-xs tracking-[0.14em] uppercase text-slate">
          Do you personally or your company control worldwide distribution rights?
          <RequiredMark />
        </p>
        <Controller
          control={control}
          name="controls_rights"
          render={({ field }) => (
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Yes, we control the rights", value: true },
                { label: "No / rights are shared or unclear", value: false },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => field.onChange(option.value)}
                  className={cn(
                    "border px-4 py-3 text-sm transition-colors",
                    field.value === option.value
                      ? "border-silver bg-surface-elevated text-ivory"
                      : "border-line-strong bg-surface text-slate hover:border-silver hover:text-ivory",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        />
        {errors.controls_rights ? (
          <p className="text-xs text-danger" role="alert">
            {errors.controls_rights.message}
          </p>
        ) : null}
      </div>

      <Textarea
        label="Territories available"
        required
        rows={2}
        hint="List territories you can offer, or write “worldwide” if unrestricted."
        error={errors.available_territories?.message}
        {...register("available_territories")}
      />

      <Textarea
        label="Rights available"
        required
        rows={2}
        hint="e.g. All rights, SVOD only, theatrical excluded, etc."
        error={errors.rights_available?.message}
        {...register("rights_available")}
      />

      <Textarea
        label={<>Existing agreements <OptionalBadge /></>}
        rows={2}
        hint="Describe any existing distribution, sales agency or licensing agreements."
        error={errors.existing_agreements?.message}
        {...register("existing_agreements")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label={<>Previous distributor <OptionalBadge /></>}
          error={errors.previous_distributor?.message}
          {...register("previous_distributor")}
        />
        <Input
          label={<>Current sales agent <OptionalBadge /></>}
          error={errors.current_sales_agent?.message}
          {...register("current_sales_agent")}
        />
      </div>

      <Textarea
        label={<>Current platform availability <OptionalBadge /></>}
        rows={2}
        hint="Is the film currently live on any platform, and if so, exclusively or non-exclusively?"
        error={errors.platform_availability?.message}
        {...register("platform_availability")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Music clearance status"
          required
          hint="e.g. Fully cleared, cue sheet pending, needs sync licenses"
          error={errors.music_clearance_status?.message}
          {...register("music_clearance_status")}
        />
        <Input
          label="Chain of title status"
          required
          hint="e.g. Complete, in progress, E&O bindable"
          error={errors.chain_of_title_status?.message}
          {...register("chain_of_title_status")}
        />
      </div>

      <Textarea
        label={<>Union / guild obligations <OptionalBadge /></>}
        rows={2}
        error={errors.union_guild_obligations?.message}
        {...register("union_guild_obligations")}
      />

      <Textarea
        label={<>Existing debts or liens against the film <OptionalBadge /></>}
        rows={2}
        error={errors.existing_debts_liens?.message}
        {...register("existing_debts_liens")}
      />

      <Input
        label={<>Date rights become available <OptionalBadge /></>}
        type="date"
        hint="Leave blank if rights are available immediately."
        error={errors.rights_available_date?.message}
        {...register("rights_available_date")}
      />

      <StepNav onBack={() => onBack(getValues())} continueLabel="Continue to materials" />
    </motion.form>
  );
});
