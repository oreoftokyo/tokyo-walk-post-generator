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

function createDrafts(photoName) {
  const cleanName = photoName?.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ')
  const seed = cleanName ? ` from “${cleanName}”` : ''

  return [
    `Found ${discoveryPhrases[0]}${seed}. Tokyo always feels warmest in these small, quiet moments.`,
    `${timePhrases[1]}${seed}: ${discoveryPhrases[4]}. Nothing loud, just a tiny discovery worth keeping.`,
    `I like when ${timePhrases[2]} offers ${discoveryPhrases[3]}. A simple reminder to look twice while walking.`,
  ]
}

function App() {
  const [photos, setPhotos] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    return () => {
      photos.forEach((photo) => URL.revokeObjectURL(photo.url))
    }
  }, [photos])

  const selectedPhoto = useMemo(
    () => photos.find((photo) => photo.id === selectedId),
    [photos, selectedId],
  )

  const drafts = useMemo(
    () => (selectedPhoto ? createDrafts(selectedPhoto.name) : []),
    [selectedPhoto],
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
        'Upload walk photos, choose one scene, and draft calm English posts for X. The app keeps everything local in your browser and never auto-posts.',
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
                    'aria-pressed': photo.id === selectedId,
                  },
                  h('img', {
                    src: photo.url,
                    alt: `Uploaded Tokyo walk: ${photo.name}`,
                  }),
                  h('span', null, photo.name),
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
                h('h2', null, 'Drafts for X'),
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
              'div',
              { className: 'draft-list' },
              drafts.map((draft, index) =>
                h(
                  'article',
                  { className: 'draft-card', key: draft },
                  h('p', { className: 'draft-number' }, `Draft ${index + 1}`),
                  h('p', null, draft),
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
            'Your thumbnails and three warm, natural post drafts will appear here after you upload images.',
          ),
        ),
  )
}

createRoot(document.getElementById('root')).render(
  h(StrictMode, null, h(App)),
)
