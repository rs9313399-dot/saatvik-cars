'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Activity, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

/* ──────────────────────────── types ───────────────────────────────────────── */

type Gender = 'male' | 'female'

interface BMIResult {
  value: number
  category: BMICategory
  color: string
  position: number // 0-100 percentage on the visual bar
  recommendation: string
}

type BMICategory = 'Underweight' | 'Normal' | 'Overweight' | 'Obese'

/* ──────────────────────────── constants ───────────────────────────────────── */

const CATEGORIES: {
  label: BMICategory
  min: number
  max: number
  color: string
  recommendation: string
}[] = [
  {
    label: 'Underweight',
    min: 0,
    max: 18.5,
    color: '#06B6D4', // cyan-500
    recommendation:
      'Consider a nutrient-rich diet with healthy fats and proteins to reach a balanced weight. Consult a nutritionist for a personalised plan.',
  },
  {
    label: 'Normal',
    min: 18.5,
    max: 24.9,
    color: '#10B981', // emerald-500
    recommendation:
      'Great job! Maintain your current lifestyle with balanced nutrition and regular exercise to stay in this healthy range.',
  },
  {
    label: 'Overweight',
    min: 25,
    max: 29.9,
    color: '#F59E0B', // amber-500
    recommendation:
      'A mix of cardio and strength training with portion-controlled meals can help you move toward a healthier weight.',
  },
  {
    label: 'Obese',
    min: 30,
    max: 60,
    color: '#F43F5E', // coral / rose-500
    recommendation:
      'It is important to seek medical guidance. Start with low-impact activities and a structured diet plan tailored to your needs.',
  },
]

/* ──────────────────────────── helpers ─────────────────────────────────────── */

function calculateBMI(
  heightCm: number,
  weightKg: number,
  age: number,
  gender: Gender
): BMIResult | null {
  if (heightCm <= 0 || weightKg <= 0 || age <= 0) return null

  const heightM = heightCm / 100
  const bmi = weightKg / (heightM * heightM)

  // Clamp BMI for the visual bar (0-50 range mapped to 0-100%)
  const clampedBmi = Math.max(10, Math.min(50, bmi))
  const position = ((clampedBmi - 10) / 40) * 100

  const category = CATEGORIES.find(
    (c) => bmi >= c.min && bmi <= c.max
  ) ?? CATEGORIES[CATEGORIES.length - 1]

  return {
    value: parseFloat(bmi.toFixed(1)),
    category: category.label,
    color: category.color,
    position,
    recommendation: category.recommendation,
  }
}

/* ──────────────────────────── animation helpers ──────────────────────────── */

const CUSTOM_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeSlideLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay, ease: CUSTOM_EASE },
})

const fadeSlideRight = (delay = 0) => ({
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.7, delay, ease: CUSTOM_EASE },
})

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: CUSTOM_EASE },
})

/* ──────────────────────────── sub-components ─────────────────────────────── */

/** Static BMI scale shown on the left info panel */
function BMIScalePreview() {
  return (
    <div className="mt-8 w-full max-w-sm">
      <div className="relative h-4 w-full overflow-hidden rounded-full">
        {/* gradient bar */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, #06B6D4 0%, #10B981 30%, #F59E0B 65%, #F43F5E 100%)',
          }}
        />
        {/* tick marks overlay */}
        <div className="absolute inset-0 flex items-end justify-between px-0">
          {[18.5, 25, 30].map((val) => {
            const pct = ((val - 10) / 40) * 100
            return (
              <div
                key={val}
                className="absolute bottom-0 h-2 w-px bg-white/40"
                style={{ left: `${pct}%` }}
              />
            )
          })}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <span style={{ color: '#06B6D4' }}>Underweight</span>
        <span style={{ color: '#10B981' }}>Normal</span>
        <span style={{ color: '#F59E0B' }}>Over</span>
        <span style={{ color: '#F43F5E' }}>Obese</span>
      </div>
    </div>
  )
}

/** Interactive result bar with animated marker */
function BMIResultBar({ position, color }: { position: number; color: string }) {
  return (
    <div className="mt-4 w-full">
      <div className="relative h-3 w-full overflow-visible rounded-full">
        {/* gradient track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(to right, #06B6D4 0%, #10B981 30%, #F59E0B 65%, #F43F5E 100%)',
          }}
        />
        {/* semi-transparent overlay to dim the track slightly */}
        <div className="absolute inset-0 rounded-full bg-black/30" />

        {/* category zone labels */}
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <span className="text-[9px] font-medium text-white/70">18.5</span>
          <span className="text-[9px] font-medium text-white/70">25</span>
          <span className="text-[9px] font-medium text-white/70">30</span>
        </div>

        {/* animated marker */}
        <motion.div
          className="absolute top-1/2 z-10 -translate-y-1/2 -translate-x-1/2"
          initial={{ left: '0%', opacity: 0 }}
          animate={{ left: `${position}%`, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          suppressHydrationWarning
        >
          <div
            className="h-5 w-5 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
          />
        </motion.div>
      </div>
    </div>
  )
}

/* ──────────────────────────── main component ─────────────────────────────── */

export default function BMICalculator() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('male')
  const [result, setResult] = useState<BMIResult | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleCalculate = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const a = parseInt(age, 10)

    if (!h || !w || !a || h <= 0 || w <= 0 || a <= 0) return

    const bmiResult = calculateBMI(h, w, a, gender)
    setResult(bmiResult)
    setShowResult(true)
  }

  const handleReset = () => {
    setHeight('')
    setWeight('')
    setAge('')
    setGender('male')
    setResult(null)
    setShowResult(false)
  }

  const isValid = useMemo(() => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    const a = parseInt(age, 10)
    return h > 0 && w > 0 && a > 0
  }, [height, weight, age])

  return (
    <section
      id="bmi"
      className="relative overflow-hidden py-20"
      style={{ backgroundColor: '#050a05' }}
    >
      {/* ── grid pattern overlay ── */}
      <div
        className="bmi-grid-fit pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* ── ambient glow ── */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] opacity-15 blur-[140px]"
        style={{ backgroundColor: '#10B981' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-[400px] w-[400px] opacity-10 blur-[120px]"
        style={{ backgroundColor: '#F43F5E' }}
        aria-hidden="true"
      />

      {/* ── content ── */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* ──── LEFT: info ──── */}
          <div className="flex-1 text-center lg:text-left">
            {/* badge */}
            <motion.div {...fadeSlideLeft(0)} suppressHydrationWarning>
              <span
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest"
                style={{
                  borderColor: '#10B981',
                  color: '#10B981',
                  backgroundColor: 'rgba(16,185,129,0.08)',
                }}
              >
                <Calculator className="size-3.5" />
                BMI CALCULATOR
              </span>
            </motion.div>

            {/* heading */}
            <motion.h2
              {...fadeSlideLeft(0.15)}
              className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl"
              suppressHydrationWarning
            >
              <span className="block text-white">Know Your</span>
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #10B981 0%, #34D399 50%, #6EE7B7 100%)',
                }}
              >
                Body
              </span>
            </motion.h2>

            {/* description */}
            <motion.p
              {...fadeSlideLeft(0.3)}
              className="mt-6 max-w-lg text-lg leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              suppressHydrationWarning
            >
              Body Mass Index (BMI) is a quick screening tool that estimates
              body fat based on your height and weight. Use our calculator to
              find out where you stand and get personalised recommendations.
            </motion.p>

            {/* info callout */}
            <motion.div
              {...fadeSlideLeft(0.4)}
              className="mt-6 inline-flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left backdrop-blur-sm"
              suppressHydrationWarning
            >
              <Info
                className="mt-0.5 size-5 shrink-0"
                style={{ color: '#10B981' }}
              />
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                BMI is a general indicator and does not account for muscle mass,
                bone density, or fat distribution. For a comprehensive health
                assessment, consult a healthcare professional.
              </p>
            </motion.div>

            {/* visual BMI scale */}
            <motion.div
              {...fadeSlideLeft(0.5)}
              suppressHydrationWarning
            >
              <BMIScalePreview />
            </motion.div>
          </div>

          {/* ──── RIGHT: calculator ──── */}
          <div className="w-full flex-1 max-w-lg">
            <motion.div
              {...fadeSlideRight(0.1)}
              suppressHydrationWarning
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-md"
            >
              <div className="mb-6 flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
                >
                  <Activity className="size-5" style={{ color: '#10B981' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Calculate Your BMI
                  </h3>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Enter your details below
                  </p>
                </div>
              </div>

              {/* form fields */}
              <div className="space-y-5">
                {/* Height */}
                <div className="space-y-2">
                  <Label
                    htmlFor="bmi-height"
                    className="text-sm font-medium"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Height (cm)
                  </Label>
                  <Input
                    id="bmi-height"
                    type="number"
                    placeholder="e.g. 175"
                    min={50}
                    max={300}
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value)
                      if (showResult) setShowResult(false)
                    }}
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:border-[#10B981] focus-visible:ring-[#10B981]/30"
                    suppressHydrationWarning
                  />
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label
                    htmlFor="bmi-weight"
                    className="text-sm font-medium"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Weight (kg)
                  </Label>
                  <Input
                    id="bmi-weight"
                    type="number"
                    placeholder="e.g. 70"
                    min={10}
                    max={500}
                    value={weight}
                    onChange={(e) => {
                      setWeight(e.target.value)
                      if (showResult) setShowResult(false)
                    }}
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:border-[#10B981] focus-visible:ring-[#10B981]/30"
                    suppressHydrationWarning
                  />
                </div>

                {/* Age */}
                <div className="space-y-2">
                  <Label
                    htmlFor="bmi-age"
                    className="text-sm font-medium"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Age
                  </Label>
                  <Input
                    id="bmi-age"
                    type="number"
                    placeholder="e.g. 25"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value)
                      if (showResult) setShowResult(false)
                    }}
                    className="h-11 border-white/10 bg-white/5 text-white placeholder:text-white/25 focus-visible:border-[#10B981] focus-visible:ring-[#10B981]/30"
                    suppressHydrationWarning
                  />
                </div>

                {/* Gender toggle */}
                <div className="space-y-2">
                  <Label
                    className="text-sm font-medium"
                    style={{ color: 'rgba(255,255,255,0.7)' }}
                  >
                    Gender
                  </Label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGender('male')
                        if (showResult) setShowResult(false)
                      }}
                      className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                        gender === 'male'
                          ? 'border-[#10B981] text-white'
                          : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                      }`}
                      style={
                        gender === 'male'
                          ? { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: '#10B981' }
                          : { backgroundColor: 'rgba(255,255,255,0.03)' }
                      }
                      suppressHydrationWarning
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGender('female')
                        if (showResult) setShowResult(false)
                      }}
                      className={`flex-1 rounded-lg border py-2.5 text-sm font-semibold transition-all ${
                        gender === 'female'
                          ? 'border-[#10B981] text-white'
                          : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                      }`}
                      style={
                        gender === 'female'
                          ? { backgroundColor: 'rgba(16,185,129,0.12)', borderColor: '#10B981' }
                          : { backgroundColor: 'rgba(255,255,255,0.03)' }
                      }
                      suppressHydrationWarning
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleCalculate}
                    disabled={!isValid}
                    className="h-11 flex-1 rounded-lg text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                    style={{ backgroundColor: '#10B981' }}
                    suppressHydrationWarning
                  >
                    <Calculator className="mr-2 size-4" />
                    Calculate BMI
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="h-11 rounded-lg border-white/10 bg-transparent px-4 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
                    suppressHydrationWarning
                  >
                    Reset
                  </Button>
                </div>
              </div>

              {/* ── Result Display ── */}
              <AnimatePresence>
                {showResult && result && (
                  <motion.div
                    key="bmi-result"
                    initial={{ opacity: 0, y: 16, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                    suppressHydrationWarning
                  >
                    <div className="mt-6 space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
                      {/* BMI value + category */}
                      <div className="flex items-end gap-4">
                        <motion.span
                          key={result.value}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="text-5xl font-extrabold leading-none"
                          style={{ color: result.color }}
                          suppressHydrationWarning
                        >
                          {result.value}
                        </motion.span>
                        <div className="mb-1">
                          <span
                            className="inline-block rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide"
                            style={{
                              color: result.color,
                              backgroundColor: `${result.color}18`,
                            }}
                          >
                            {result.category}
                          </span>
                        </div>
                      </div>

                      {/* Visual bar */}
                      <BMIResultBar
                        position={result.position}
                        color={result.color}
                      />

                      {/* Recommendation */}
                      <motion.div
                        {...fadeUp(0.3)}
                        className="flex items-start gap-2 pt-1"
                        suppressHydrationWarning
                      >
                        <Activity
                          className="mt-0.5 size-4 shrink-0"
                          style={{ color: result.color }}
                        />
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: 'rgba(255,255,255,0.55)' }}
                        >
                          {result.recommendation}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── scoped styles for grid overlay ── */}
      <style jsx>{`
        .bmi-grid-fit {
          background-image:
            linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
      `}</style>
    </section>
  )
}
