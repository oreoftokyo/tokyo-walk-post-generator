import React, { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'

const { createElement: h } = React

const discoveryPhrases = [
  'a narrow side street holding onto the afternoon light',
  'a small doorway with plants quietly taking over the corner',
  'the soft pause between station noise and a residential lane',
  'a little texture of the city that feels easy to miss',
  'a calm pocket of Tokyo tucked just off the usual path',
  'the kind of ordinary scene that makes a walk feel personal',
]

const timePhrases = [
  "today's walk",
  'a slow Tokyo wander',
  'this quiet stretch of the city',
  'a gentle detour through the neighborhood',
  'an unhurried moment between errands',
]

const styleTemplates = [
  {
    id: 'calm',
    label: 'Calm',
    helper: 'Quiet, observant, and simple.',
    createPost: ({ scene, context }) =>
      `A small pause from ${scene}. ${context}Nothing dramatic, just a quiet Tokyo moment that made the walk feel softer.`,
  },
  {
    id: 'emotional',
    label: 'Emotional',
    helper: 'Warm, personal, and reflective.',
    createPost: ({ scene, context }) =>
      `I keep thinking about ${scene}. ${context}It felt like one of those tiny Tokyo moments that stays with you longer than expected.`,
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    helper: 'Visual, atmospheric, and story-like.',
    createPost: ({ scene, context }) =>
      `Tokyo, framed in a quiet cutaway: ${scene}. ${context}Soft light, small details, and the feeling that the city is telling a story in the background.`,
  },
]

function getPhotoSeed(photoName) {
  const cleanName = photoName?.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
  return cleanName ? `“${cleanName}”` : discoveryPhrases[0]
}

function formatMoodContext(moodText) {
  const trimmedMood = moodText.trim().replace(/\s+/g, ' ')
  return trimmedMood ? `${trimmedMood}. ` : ''
}

function createDrafts(photoName, moodText) {
  const seed = getPhotoSeed(photoName)
  const context = formatMoodContext(moodText)
  const scene = seed.startsWith('“') ? `${timePhrases[1]} from ${seed}` : seed

  return styleTemplates.map((style) => ({
    ...style,
    post: style.createPost({ scene, context }),
  }))
}

function App() {
  const [photos, setPhotos] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [moodText, setMoodText] = useState('')
  const [copiedStyle, setCopiedStyle] = useState(null)

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url))
    }
  }, [photos])

  useEffect(() => {
    if (!copiedStyle) {
      return undefined
    }

    const timeout = window.setTimeout(() => setCopiedStyle(null), 1800)
    return () => window.clearTimeout(timeout)
  }, [copiedStyle])

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedId),
    [photos, selectedId],
  )

  const drafts = useMemo(
    () => (selectedPhoto ? createDrafts(selectedPhoto.name, moodText) : []),
    [moodText, selectedPhoto],
  )

  function handlePhotoUpload(event) {
    const files = Array.from(event.target.files ?? [])
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    if (!imageFiles.length) {
      return
    }

    const nextPhotos = imageFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setPhotos((currentPhotos) => [...currentPhotos, ...nextPhotos])
    setSelectedId((currentId) => currentId ?? nextPhotos[0].id)
    event.target.value = ''
  }

  function clearPhotos() {
    photos.forEach((photo) => URL.revokeObjectURL(photo.url))
    setPhotos([])
    setSelectedId(null)
    setCopiedStyle(null)
  }

  async function copyDraft(styleId, post) {
    await navigator.clipboard.writeText(post)
    setCopiedStyle(styleId)
  }

  return h(
    'main',
    { className: 'app-shell' },
    h(
      'section',
      { className: 'hero-card', 'aria-labelledby': 'app-title' },
      h('p', { className: 'eyebrow' }, 'Quiet Tokyo walks'),
      h('h1', { id: 'app-title' }, 'Tokyo Walk Post Generator'),
      h(
        'p',
        { className: 'intro' },
        'Upload walk photos, choose one scene, add a little mood or location context, and create three elegant post styles for X. Everything stays local in your browser.',
      ),
      h(
        'label',
        { className: 'upload-panel' },
        h('span', { className: 'upload-title' }, 'Upload photos'),
        h(
          'span',
          { className: 'upload-copy' },
          'Select multiple images from a Tokyo walk to begin.',
        ),
        h('input', {
          type: 'file',
          accept: 'image/*',
          multiple: true,
          onChange: handlePhotoUpload,
        }),
      ),
    ),
    photos.length > 0
      ? h(
          'section',
          { className: 'workspace', 'aria-label': 'Photo selection and drafts' },
          h(
            'div',
            { className: 'photo-column' },
            h(
              'div',
              { className: 'section-heading' },
              h(
                'div',
                null,
                h('p', { className: 'eyebrow' }, 'Step 1'),
                h('h2', null, 'Choose a photo'),
              ),
              h(
                'button',
                { className: 'text-button', type: 'button', onClick: clearPhotos },
                'Clear all',
              ),
            ),
            h(
              'div',
              { className: 'thumbnail-grid' },
              photos.map((photo) =>
                h(
                  'button',
                  {
                    className: `thumbnail ${photo.id === selectedId ? 'selected' : ''}`,
                    key: photo.id,
                    type: 'button',
                    onClick: () => setSelectedId(photo.id),
                    'aria-label': `Select ${photo.name}`,
                    'aria-pressed': photo.id === selectedId,
                  },
                  h(
                    'span',
                    { className: 'thumbnail-image-wrap' },
                    h('img', {
                      src: photo.url,
                      alt: `Uploaded Tokyo walk: ${photo.name}`,
                    }),
                  ),
                  h('span', { className: 'thumbnail-name' }, photo.name),
                ),
              ),
            ),
          ),
          h(
            'div',
            { className: 'draft-column' },
            h(
              'div',
              { className: 'section-heading' },
              h(
                'div',
                null,
                h('p', { className: 'eyebrow' }, 'Step 2'),
                h('h2', null, 'Add context'),
              ),
            ),
            selectedPhoto &&
              h(
                'article',
                { className: 'selected-preview' },
                h('img', {
                  src: selectedPhoto.url,
                  alt: `Selected Tokyo walk: ${selectedPhoto.name}`,
                }),
                h(
                  'div',
                  null,
                  h('p', { className: 'preview-label' }, 'Selected moment'),
                  h('h3', null, selectedPhoto.name),
                ),
              ),
            h(
              'label',
              { className: 'mood-field' },
              h('span', null, 'Mood or location'),
              h('textarea', {
                value: moodText,
                onChange: (event) => setMoodText(event.target.value),
                placeholder: 'Example: after light rain near Yanaka, quiet and nostalgic',
                rows: 4,
              }),
            ),
            h(
              'div',
              { className: 'draft-heading' },
              h('p', { className: 'eyebrow' }, 'Step 3'),
              h('h2', null, 'Generated styles'),
            ),
            h(
              'div',
              { className: 'draft-list' },
              drafts.map((draft) =>
                h(
                  'article',
                  { className: 'draft-card', key: draft.id },
                  h(
                    'div',
                    { className: 'draft-card-header' },
                    h(
                      'div',
                      null,
                      h('p', { className: 'draft-number' }, draft.label),
                      h('p', { className: 'draft-helper' }, draft.helper),
                    ),
                    h(
                      'button',
                      {
                        className: 'copy-button',
                        type: 'button',
                        onClick: () => copyDraft(draft.id, draft.post),
                      },
                      copiedStyle === draft.id ? 'Copied' : 'Copy',
                    ),
                  ),
                  h('p', { className: 'draft-post' }, draft.post),
                ),
              ),
            ),
          ),
        )
      : h(
          'section',
          { className: 'empty-state', 'aria-label': 'No photos uploaded' },
          h(
            'p',
            null,
            'Your preview thumbnails, selected photo, mood field, and calm / emotional / cinematic posts will appear here after you upload images.',
          ),
        ),
  )
}

createRoot(document.getElementById('root')).render(
  h(StrictMode, null, h(App)),
)
