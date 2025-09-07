'use client'

import { startTransition, useState }  from 'react'
import { useRouter }                  from 'next/navigation'
import { toast }                      from 'sonner'
import { upsertBook }                 from './actions'

export default function BookForm({ book }: { book?: any }) {
  const router  = useRouter()
  const [saving, setSaving] = useState(false)

  /* -- submit ----------------------------------------------------------- */
  async function handleSubmit(formData: FormData) {
    setSaving(true)
    const res = await upsertBook(null, formData)
    setSaving(false)

    if (res.ok) {
      toast.success('Saved!')
      // transition avoids a React-Server flush “flash”
      startTransition(() => router.push('/admin/books'))
    } else toast.error('Failed to save')
  }

  /* tags ↔ comma-string helper ----------------------------------------- */
  const [tagsStr, setTagsStr] = useState((book?.tags ?? []).join(', '))
  const tagList: string[] = tagsStr
  .split(',')
  .map((tag: string) => tag.trim())          // already typed ✅
  .filter((tag: string): tag is string => Boolean(tag))  // 🔹 add :string here

  /* -- form ------------------------------------------------------------- */
  return (
    <form action={handleSubmit} className="mx-auto max-w-xl space-y-6">
      {book?.id && <input type="hidden" name="id" defaultValue={book.id} />}

      <TextInput name="title"  label="Title"   defaultValue={book?.title}  required />
      <TextInput name="author" label="Author"  defaultValue={book?.author} required />
      <TextInput name="slug"   label="Slug (URL-safe)" defaultValue={book?.slug} required />

      <Textarea  name="description" label="Description" defaultValue={book?.description} />

      <TextInput name="priceINR" label="Price (₹ 0 = free)" type="number"
                 defaultValue={book?.priceINR ?? 0} />

      <TextInput name="pages" label="Pages" type="number"
                 defaultValue={book?.pages ?? 0} />

      <div>
        <label className="mb-1 block text-sm">Premium?</label>
        <input
          type="checkbox"
          name="isPremium"
          defaultChecked={book?.isPremium}
          className="h-4 w-4 accent-emerald-500"
        />
      </div>

      {/* tags */}
      <div>
        <label className="mb-1 block text-sm">Tags (comma-separated)</label>
        <input
          className="w-full rounded bg-black/20 p-2"
          value={tagsStr}
          onChange={e => setTagsStr(e.target.value)}
        />
        {tagList.map(tag => (
          <input key={tag} type="hidden" name="tags" value={tag} />
        ))}
      </div>

      <FileInput name="coverFile" label="Cover image (PNG/JPG)" accept="image/*" />
      <FileInput name="pdfFile"   label="Full PDF"              accept="application/pdf" />
      <FileInput name="samplePdf" label="Sample PDF"            accept="application/pdf" />

      <button
        disabled={saving}
        className="rounded bg-emerald-500 px-4 py-2 font-medium hover:bg-emerald-400 disabled:opacity-40"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}

/* ── Field helpers ─────────────────────────────────────────────── */

function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <input {...rest} className="mt-1 w-full rounded bg-black/20 p-2" />
    </label>
  )
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <textarea {...rest} rows={4} className="mt-1 w-full rounded bg-black/20 p-2" />
    </label>
  )
}

function FileInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...rest } = props
  return (
    <label className="block">
      <span className="mb-1 block text-sm">{label}</span>
      <input {...rest} type="file" className="w-full text-sm" />
    </label>
  )
}
