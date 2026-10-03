import { useEffect, useReducer, useRef } from 'react'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { FiArrowLeft, FiArrowRight, FiRefreshCw } from 'react-icons/fi'
import { briefTagLabels, briefTimelines, briefTypes } from '../data/brief'
import { localize } from '../data/localize'
import { profile } from '../data/profile'
import {
  BRIEF_TAGS,
  characterCount,
  EMPTY_BRIEF,
  LIMITS,
  STEP_COUNT,
  STEP_FIELDS,
  validateBrief,
} from '../lib/briefSchema'
import { briefReducer, initialBriefState } from '../lib/briefState'
import { clearDraft, loadDraft, saveDraft } from '../lib/briefDraft'
import { sendBrief } from '../lib/briefClient'
import { fill } from '../lib/format'
import { useLang, useT } from '../i18n/useLang'
import CopyEmailButton from './CopyEmailButton'
import SectionHeading from './SectionHeading'
import './css/Brief.css'

const QUESTIONS = ['briefQ1', 'briefQ2', 'briefQ3', 'briefQ4']
const KNOWN_FIELDS = STEP_FIELDS.flat()
const CHOICE_FIELDS = ['type', 'timeline']
const ERROR_KEYS = {
  required: 'errRequired',
  invalid_choice: 'errChoose',
  too_short: 'errTooShort',
  too_long: 'errTooLong',
  invalid_email: 'errInvalidEmail',
  invalid_phone: 'errInvalidPhone',
  must_accept: 'errMustAccept',
  invalid: 'errInvalid',
}

// An empty choice is not "a required field": tell the visitor to pick one.
const errorKey = (field, code) => (code === 'required' && CHOICE_FIELDS.includes(field) ? 'errChoose' : (ERROR_KEYS[code] ?? 'errInvalid'))

const labelOf = (list, id, lang) => localize(list.find((item) => item.id === id)?.label, lang) ?? ''
const describedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined
const errorId = (field, code) => (code ? `brief-error-${field}` : undefined)

function FieldError({ field, code }) {
  const t = useT()
  if (!code) return null
  return (
    <p id={`brief-error-${field}`} className="brief-error">
      {t(errorKey(field, code))}
    </p>
  )
}

function ChoiceGroup({ name, options, value, error, lang, onChange }) {
  return (
    <div
      className="brief-choices"
      role="radiogroup"
      aria-labelledby="brief-question"
      aria-describedby={errorId(name, error)}
    >
      {options.map((option) => (
        <label key={option.id} className="brief-choice">
          <input
            type="radio"
            name={`brief-${name}`}
            value={option.id}
            checked={value === option.id}
            onChange={() => onChange(option.id)}
            aria-invalid={error ? 'true' : undefined}
          />
          <span>{localize(option.label, lang)}</span>
        </label>
      ))}
    </div>
  )
}

function TextField({ field, label, type = 'text', autoComplete, inputMode, value, error, onChange }) {
  const id = `brief-${field}`
  return (
    <div className="brief-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId(field, error)}
      />
      <FieldError field={field} code={error} />
    </div>
  )
}

function BriefFailure({ kind, sending, onRetry }) {
  const t = useT()
  if (kind === 'invalid') {
    return (
      <p className="brief-failure" role="alert">
        {t('briefInvalid')}
      </p>
    )
  }
  return (
    <div className="brief-failure" role="alert">
      <p>{t(kind === 'rate_limited' ? 'briefRateLimited' : 'briefFailed')}</p>
      <p className="brief-failure-actions">
        {kind !== 'rate_limited' && (
          <button type="button" className="btn" onClick={onRetry} disabled={sending}>
            <FiRefreshCw aria-hidden="true" />
            {t('briefRetry')}
          </button>
        )}
        <span>
          {t('briefOrEmail')} <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </span>
      </p>
    </div>
  )
}

function BriefSuccess({ data, headingRef, lang }) {
  const t = useT()
  const tags = data.tags.map((tag) => localize(briefTagLabels[tag], lang)).join(', ')
  return (
    <div className="brief-success" role="status">
      <svg className="brief-check" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="24" />
        <path d="M15 27l7 7 15-16" />
      </svg>
      <h3 ref={headingRef} tabIndex={-1}>
        {fill(t('briefSuccess'), { name: data.name.trim() })}
      </h3>
      <p className="brief-summary-title">{t('briefSummary')}</p>
      <dl className="brief-summary">
        <div>
          <dt>{t('summaryType')}</dt>
          <dd>{tags ? `${labelOf(briefTypes, data.type, lang)} · ${tags}` : labelOf(briefTypes, data.type, lang)}</dd>
        </div>
        <div>
          <dt>{t('summaryDetails')}</dt>
          <dd>{data.details.trim()}</dd>
        </div>
        <div>
          <dt>{t('summaryTimeline')}</dt>
          <dd>{labelOf(briefTimelines, data.timeline, lang)}</dd>
        </div>
        <div>
          <dt>{t('summaryContact')}</dt>
          <dd>{[data.name, data.email, data.phone].map((value) => value.trim()).filter(Boolean).join(' · ')}</dd>
        </div>
      </dl>
    </div>
  )
}

export default function Brief() {
  const lang = useLang()
  const t = useT()
  const [state, dispatch] = useReducer(briefReducer, undefined, initialBriefState)
  const { step, data, errors, status, failure, direction, attempt } = state
  const formRef = useRef(null)
  const questionRef = useRef(null)
  const successRef = useRef(null)
  const honeypotRef = useRef(null)
  const openedAt = useRef(null)
  const lastInput = useRef('pointer')
  const sending = useRef(false)
  const wasSendingRef = useRef(false)
  const shownStep = useRef(step)
  const shownAttempt = useRef(attempt)

  // sessionStorage only exists in the browser: restore after hydration.
  useEffect(() => {
    const draft = loadDraft()
    if (draft) dispatch({ type: 'restore', draft })
  }, [])

  useEffect(() => {
    // EMPTY_BRIEF is the untouched initial object: never overwrite a stored draft with it.
    if (status === 'success' || data === EMPTY_BRIEF) return
    saveDraft(data)
  }, [data, status])

  useEffect(() => {
    if (shownStep.current === step) return
    shownStep.current = step
    questionRef.current?.focus()
  }, [step])

  useEffect(() => {
    if (shownAttempt.current === attempt) return
    shownAttempt.current = attempt
    formRef.current?.querySelector('[aria-invalid="true"]')?.focus()
  }, [attempt])

  useEffect(() => {
    if (status === 'success') successRef.current?.focus()
  }, [status])

  // The send button was disabled (and lost the focus) while sending: after a plain failure, hand the focus to the retry.
  useEffect(() => {
    const wasSending = wasSendingRef.current
    wasSendingRef.current = status === 'sending'
    if (!wasSending || status !== 'editing' || !failure || failure === 'invalid') return
    const target = formRef.current?.querySelector('.brief-failure-actions button') ?? formRef.current?.querySelector('button[type="submit"]')
    target?.focus()
  }, [status, failure])

  const markStart = () => {
    if (openedAt.current === null) openedAt.current = Date.now()
  }

  const submit = async () => {
    if (sending.current) return
    const result = validateBrief(data)
    if (!result.ok) {
      dispatch({ type: 'invalid', errors: result.errors })
      return
    }
    sending.current = true
    dispatch({ type: 'submitStart' })
    const response = await sendBrief({
      ...result.value,
      website: honeypotRef.current?.value ?? '',
      elapsedMs: Date.now() - (openedAt.current ?? Date.now()),
    })
    sending.current = false
    if (response.ok) {
      clearDraft()
      dispatch({ type: 'submitSuccess' })
      return
    }
    // A rejection that names no known field (spam check, bad JSON) is a plain failure: nothing to point at.
    const fields = (response.fields ?? []).filter((field) => KNOWN_FIELDS.includes(field))
    const kind = response.kind === 'invalid' && fields.length === 0 ? 'failed' : response.kind
    dispatch({ type: 'submitFailure', kind, fields })
  }

  const advance = () => {
    if (step < STEP_COUNT - 1) dispatch({ type: 'next', instant: lastInput.current === 'keyboard' })
    else submit()
  }

  const onKeyDown = (event) => {
    lastInput.current = 'keyboard'
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    const tag = event.target.tagName
    if (tag === 'TEXTAREA' || tag === 'BUTTON' || tag === 'A') return
    event.preventDefault()
    advance()
  }

  const change = (field) => (value) => dispatch({ type: 'change', field, value })
  const tags = BRIEF_TAGS[data.type] ?? []
  const hint = (briefTypes.find((type) => type.id === data.type) ?? briefTypes[briefTypes.length - 1]).hint
  const stepLabel = fill(t('briefStepOf'), { current: step + 1, total: STEP_COUNT })

  return (
    <section id="brief" className="section brief" aria-labelledby="brief-title">
      <div className="container brief-layout">
        <div className="brief-intro">
          <SectionHeading id="brief-title" eyebrow="05" title={t('ctaBrief')} />
          <p className="brief-lead">{t('briefIntro')}</p>
          <div className="brief-other">
            <p className="brief-other-title">{t('briefOther')}</p>
            <CopyEmailButton email={profile.email} />
            <ul className="brief-other-links">
              <li>
                <a className="btn" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                  <FaLinkedin aria-hidden="true" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a className="btn" href={profile.github} target="_blank" rel="noopener noreferrer">
                  <FaGithub aria-hidden="true" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="card brief-card">
          {status === 'success' ? (
            <BriefSuccess data={data} headingRef={successRef} lang={lang} />
          ) : (
            <form
              ref={formRef}
              className="brief-form"
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                advance()
              }}
              onKeyDown={onKeyDown}
              onPointerDownCapture={() => {
                lastInput.current = 'pointer'
                markStart()
              }}
              onFocusCapture={markStart}
            >
              <div className="brief-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${(step + 1) / STEP_COUNT})` }} />
              </div>
              <p className="brief-step-count mono" aria-hidden="true">
                {stepLabel}
              </p>
              <p className="sr-only" aria-live="polite">
                {`${stepLabel}: ${t(QUESTIONS[step])}`}
              </p>
              <div className="brief-honeypot" aria-hidden="true">
                <label>
                  {t('briefHoneypot')}
                  <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              <fieldset key={step} className="brief-step" data-direction={direction} aria-labelledby="brief-question">
                <h3 id="brief-question" ref={questionRef} tabIndex={-1}>
                  {t(QUESTIONS[step])}
                </h3>

                {step === 0 && (
                  <>
                    <ChoiceGroup
                      name="type"
                      options={briefTypes}
                      value={data.type}
                      error={errors.type}
                      lang={lang}
                      onChange={change('type')}
                    />
                    <FieldError field="type" code={errors.type} />
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="brief-field">
                      <label htmlFor="brief-details">{t('briefDetailsLabel')}</label>
                      <p id="brief-details-hint" className="brief-hint">
                        {localize(hint, lang)}
                      </p>
                      <textarea
                        id="brief-details"
                        rows={6}
                        value={data.details}
                        onChange={(event) => change('details')(event.target.value)}
                        aria-invalid={errors.details ? 'true' : undefined}
                        aria-describedby={describedBy(
                          'brief-details-hint',
                          'brief-details-count',
                          errorId('details', errors.details),
                        )}
                      />
                      <p id="brief-details-count" className="brief-count mono">
                        {fill(t('briefCount'), { count: characterCount(data.details), max: LIMITS.detailsMax })}
                      </p>
                      <FieldError field="details" code={errors.details} />
                    </div>
                    {tags.length > 0 && (
                      <fieldset className="brief-tags">
                        <legend>{t('briefTagsLabel')}</legend>
                        <div className="brief-tag-list">
                          {tags.map((tag) => (
                            <label key={tag} className="brief-tag">
                              <input
                                type="checkbox"
                                checked={data.tags.includes(tag)}
                                onChange={() => dispatch({ type: 'toggleTag', tag })}
                                aria-invalid={errors.tags ? 'true' : undefined}
                                aria-describedby={errorId('tags', errors.tags)}
                              />
                              <span>{localize(briefTagLabels[tag], lang)}</span>
                            </label>
                          ))}
                        </div>
                        <FieldError field="tags" code={errors.tags} />
                      </fieldset>
                    )}
                  </>
                )}

                {step === 2 && (
                  <>
                    <ChoiceGroup
                      name="timeline"
                      options={briefTimelines}
                      value={data.timeline}
                      error={errors.timeline}
                      lang={lang}
                      onChange={change('timeline')}
                    />
                    <FieldError field="timeline" code={errors.timeline} />
                  </>
                )}

                {step === 3 && (
                  <>
                    <TextField
                      field="name"
                      label={t('briefName')}
                      autoComplete="name"
                      value={data.name}
                      error={errors.name}
                      onChange={change('name')}
                    />
                    <TextField
                      field="email"
                      label={t('briefEmail')}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={data.email}
                      error={errors.email}
                      onChange={change('email')}
                    />
                    <TextField
                      field="phone"
                      label={t('briefPhone')}
                      type="tel"
                      autoComplete="tel"
                      value={data.phone}
                      error={errors.phone}
                      onChange={change('phone')}
                    />
                    <div className="brief-field">
                      <label className="brief-consent">
                        <input
                          type="checkbox"
                          checked={data.privacy}
                          onChange={(event) => change('privacy')(event.target.checked)}
                          aria-invalid={errors.privacy ? 'true' : undefined}
                          aria-describedby={errorId('privacy', errors.privacy)}
                        />
                        <span>
                          {t('briefPrivacyBefore')}
                          <a href="/privacidad" target="_blank" rel="noopener noreferrer">
                            {t('briefPrivacyLink')}
                          </a>
                          {t('briefPrivacyAfter')}
                        </span>
                      </label>
                      <FieldError field="privacy" code={errors.privacy} />
                    </div>
                  </>
                )}
              </fieldset>

              {failure && <BriefFailure kind={failure} sending={status === 'sending'} onRetry={submit} />}

              <div className="brief-actions">
                {step > 0 && (
                  <button
                    type="button"
                    className="btn"
                    onClick={(event) => dispatch({ type: 'back', instant: event.detail === 0 })}
                  >
                    <FiArrowLeft aria-hidden="true" />
                    {t('briefBack')}
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                  {step < STEP_COUNT - 1 ? t('briefNext') : status === 'sending' ? t('briefSending') : t('briefSubmit')}
                  {step < STEP_COUNT - 1 && <FiArrowRight aria-hidden="true" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
