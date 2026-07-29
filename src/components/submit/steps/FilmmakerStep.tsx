"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { compactPartial, type StepHandle } from "@/components/submit/form-utils";
import { StepHeader, StepNav } from "@/components/submit/StepChrome";
import { filmmakerSchema, type FilmmakerInput } from "@/lib/validations/submission";

const DEFAULTS: FilmmakerInput = {
  full_name: "",
  email: "",
  phone: "",
  company: "",
  city: "",
  province_state: "",
  country: "",
  role_on_film: "",
  website: "",
  imdb_profile: "",
  how_heard: "",
};

export interface FilmmakerStepProps {
  defaultValues?: Partial<FilmmakerInput>;
  onNext: (data: FilmmakerInput) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onValuesChange?: (values: Record<string, unknown>) => void;
}

export const FilmmakerStep = forwardRef<StepHandle, FilmmakerStepProps>(function FilmmakerStep(
  { defaultValues, onNext, onDirtyChange, onValuesChange },
  ref,
) {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<FilmmakerInput>({
    resolver: zodResolver(filmmakerSchema),
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
        step={1}
        title="Filmmaker details"
        description="Tell us who you are and how our team can reach you about this submission."
        estimate="About 8 fields"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Full name"
          required
          autoComplete="name"
          error={errors.full_name?.message}
          {...register("full_name")}
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone"
          type="tel"
          autoComplete="tel"
          hint="Optional, but helpful if we need to reach you quickly."
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          label="Company / production banner"
          autoComplete="organization"
          error={errors.company?.message}
          {...register("company")}
        />
        <Input label="City" required autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
        <Input
          label="Province / state"
          required
          autoComplete="address-level1"
          error={errors.province_state?.message}
          {...register("province_state")}
        />
        <Input
          label="Country"
          required
          autoComplete="country-name"
          error={errors.country?.message}
          {...register("country")}
        />
        <Input
          label="Role on this film"
          required
          hint="e.g. Director, Producer, Sales representative"
          error={errors.role_on_film?.message}
          {...register("role_on_film")}
        />
        <Input
          label="Website"
          type="url"
          placeholder="https://"
          error={errors.website?.message}
          {...register("website")}
        />
        <Input
          label="IMDb profile"
          type="url"
          placeholder="https://www.imdb.com/name/..."
          error={errors.imdb_profile?.message}
          {...register("imdb_profile")}
        />
      </div>

      <Textarea
        label="How did you hear about Silver Spring Studios?"
        required
        rows={2}
        maxLength={500}
        error={errors.how_heard?.message}
        {...register("how_heard")}
      />

      <StepNav continueLabel="Continue to film details" />
    </motion.form>
  );
});
