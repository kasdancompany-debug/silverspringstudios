"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { compactPartial, type StepHandle } from "@/components/submit/form-utils";
import { OptionalBadge, StepHeader, StepNav } from "@/components/submit/StepChrome";
import { BUDGET_RANGES, FILM_FORMATS, GENRES } from "@/lib/constants";
import { filmSchema, type FilmInput } from "@/lib/validations/submission";

const FORMAT_LABELS: Record<(typeof FILM_FORMATS)[number], string> = {
  feature: "Feature film",
  documentary: "Documentary",
  limited_series: "Limited series",
  other: "Other",
};

const FORMAT_OPTIONS = FILM_FORMATS.map((value) => ({ value, label: FORMAT_LABELS[value] }));
const GENRE_OPTIONS = GENRES.map((value) => ({ value, label: value }));
const BUDGET_OPTIONS = BUDGET_RANGES.map((value) => ({ value, label: value }));

const DEFAULTS: FilmInput = {
  title: "",
  alternative_title: "",
  format: "feature",
  genre: "",
  secondary_genre: "",
  runtime_minutes: undefined as unknown as number,
  completion_year: undefined as unknown as number,
  country_of_origin: "",
  primary_language: "",
  subtitle_availability: "",
  logline: "",
  synopsis: "",
  director: "",
  producers: "",
  principal_cast: "",
  budget_range: undefined as unknown as FilmInput["budget_range"],
  notable_awards: "",
  festival_history: "",
  press_coverage: "",
  target_audience: "",
  comparable_films: "",
  audience_rationale: "",
};

export interface FilmStepProps {
  defaultValues?: Partial<FilmInput>;
  onNext: (data: FilmInput) => void;
  onBack: (values: Partial<FilmInput>) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onValuesChange?: (values: Record<string, unknown>) => void;
}

export const FilmStep = forwardRef<StepHandle, FilmStepProps>(function FilmStep(
  { defaultValues, onNext, onBack, onDirtyChange, onValuesChange },
  ref,
) {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isDirty },
  } = useForm<FilmInput>({
    resolver: zodResolver(filmSchema),
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
        step={2}
        title="The film"
        description="Give us the essentials of the completed film you would like us to consider."
        estimate="Longer section — logline and synopsis"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Input label="Film title" required error={errors.title?.message} {...register("title")} />
        <Input
          label={<>Alternative / working title <OptionalBadge /></>}
          error={errors.alternative_title?.message}
          {...register("alternative_title")}
        />
        <Select
          label="Format"
          required
          options={FORMAT_OPTIONS}
          error={errors.format?.message}
          {...register("format")}
        />
        <Select
          label="Primary genre"
          required
          placeholder="Select a genre"
          options={GENRE_OPTIONS}
          error={errors.genre?.message}
          {...register("genre")}
        />
        <Input
          label={<>Secondary genre <OptionalBadge /></>}
          error={errors.secondary_genre?.message}
          {...register("secondary_genre")}
        />
        <Input
          label="Runtime (minutes)"
          type="number"
          required
          min={1}
          error={errors.runtime_minutes?.message}
          {...register("runtime_minutes", { valueAsNumber: true })}
        />
        <Input
          label="Completion year"
          type="number"
          required
          min={1900}
          error={errors.completion_year?.message}
          {...register("completion_year", { valueAsNumber: true })}
        />
        <Select
          label="Budget range"
          required
          placeholder="Select a budget range"
          options={BUDGET_OPTIONS}
          error={errors.budget_range?.message}
          {...register("budget_range")}
        />
        <Input
          label="Country of origin"
          required
          error={errors.country_of_origin?.message}
          {...register("country_of_origin")}
        />
        <Input
          label="Primary language"
          required
          error={errors.primary_language?.message}
          {...register("primary_language")}
        />
      </div>

      <Textarea
        label="Subtitle / caption availability"
        required
        rows={2}
        hint="e.g. English burned-in subtitles for non-English dialogue; SDH captions available on request."
        error={errors.subtitle_availability?.message}
        {...register("subtitle_availability")}
      />

      <Textarea
        label="Logline"
        required
        rows={2}
        maxLength={500}
        hint="A one- or two-sentence summary. Maximum 500 characters."
        error={errors.logline?.message}
        {...register("logline")}
      />

      <Textarea
        label="Synopsis"
        required
        rows={6}
        maxLength={5000}
        hint="Maximum 5,000 characters."
        error={errors.synopsis?.message}
        {...register("synopsis")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Input label="Director(s)" required error={errors.director?.message} {...register("director")} />
        <Input label="Producer(s)" required error={errors.producers?.message} {...register("producers")} />
      </div>

      <Textarea
        label="Principal cast or subjects"
        required
        rows={2}
        error={errors.principal_cast?.message}
        {...register("principal_cast")}
      />

      <Textarea
        label={<>Notable awards <OptionalBadge /></>}
        rows={2}
        error={errors.notable_awards?.message}
        {...register("notable_awards")}
      />

      <Textarea
        label={<>Festival history <OptionalBadge /></>}
        rows={2}
        error={errors.festival_history?.message}
        {...register("festival_history")}
      />

      <Textarea
        label={<>Press coverage <OptionalBadge /></>}
        rows={2}
        error={errors.press_coverage?.message}
        {...register("press_coverage")}
      />

      <Textarea
        label="Target audience"
        required
        rows={3}
        error={errors.target_audience?.message}
        {...register("target_audience")}
      />

      <Input
        label={<>Comparable films <OptionalBadge /></>}
        hint="Films that share tone, genre or audience with yours."
        error={errors.comparable_films?.message}
        {...register("comparable_films")}
      />

      <Textarea
        label="Audience rationale"
        required
        rows={3}
        hint="Why will this specific audience seek out and watch this film?"
        error={errors.audience_rationale?.message}
        {...register("audience_rationale")}
      />

      <StepNav onBack={() => onBack(getValues())} continueLabel="Continue to rights" />
    </motion.form>
  );
});
