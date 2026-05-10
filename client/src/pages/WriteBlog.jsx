import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { createPost, updatePost, getPostById } from '../services/postApi'
import { useAuth } from '../context/AuthContext'
import { toast } from '../components/Toast'
import { Button } from '../components/ui/button'

export default function WriteBlog() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    content: '',
    category: 'Technology',
    tags: [],
    featuredImage: '',
    status: 'draft',
    publishedAt: new Date().toISOString().split('T')[0],
  })
  const [tagInput, setTagInput] = useState('')
  const [imagePreview, setImagePreview] = useState('')

  const categories = [
    'Technology',
    'Lifestyle',
    'Travel',
    'Food',
    'Business',
    'Health',
    'Education',
    'Entertainment',
    'Sports',
    'Other',
  ]

  useEffect(() => {
    if (!token) navigate('/login')
  }, [token, navigate])

  useEffect(() => {
    if (id) {
      fetchPost()
    }
  }, [id])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const data = await getPostById(id)
      const post = data?.post || data?.data || data
      setForm({
        title: post.title || '',
        description: post.description || '',
        content: post.content || '',
        category: post.category || 'Technology',
        tags: post.tags || [],
        featuredImage: post.featuredImage || '',
        status: post.status || 'draft',
        publishedAt:
          post.publishedAt?.split('T')[0] ||
          new Date().toISOString().split('T')[0],
      })
      setImagePreview(post.featuredImage || '')
    } catch (err) {
      toast(err.message || 'Failed to fetch post', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast('Please select an image file', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('Image size must be less than 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target.result)
      setForm((f) => ({ ...f, featuredImage: event.target.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (status) => {
    if (!form.title.trim()) {
      toast('Title is required', 'error')
      return
    }

    if (!form.content.trim()) {
      toast('Content is required', 'error')
      return
    }

    if (!form.description.trim()) {
      toast('Description is required', 'error')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        status,
        publishedAt: status === 'scheduled' ? form.publishedAt : undefined,
      }

      if (id) {
        await updatePost(token, id, payload)
        toast('Post updated successfully', 'success')
      } else {
        await createPost(token, payload)
        toast('Post created successfully', 'success')
      }

      navigate('/my-profile')
    } catch (err) {
      toast(err.message || 'Failed to save post', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading && id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen bg-background py-8 px-4 sm:px-8"
    >
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8 font-semibold"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold font-headline text-on-surface mb-2">
            {id ? 'Edit Post' : 'Write a New Blog Post'}
          </h1>
          <p className="text-on-surface-variant">
            Share your thoughts and ideas with the world.
          </p>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
              >
                Post Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter your blog post title..."
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/45 bg-surface-container/70 text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
              >
                Description (Short summary)
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Write a brief description of your post..."
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/45 bg-surface-container/70 text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Write your blog post content here..."
                rows="12"
                className="w-full px-4 py-3 rounded-xl border border-outline-variant/45 bg-surface-container/70 text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all resize-none font-mono text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="image"
                className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
              >
                Featured Image
              </label>
              <div className="relative border-2 border-dashed border-outline-variant/40 rounded-xl p-6 hover:border-primary/40 transition-colors cursor-pointer group">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {imagePreview ? (
                  <div className="relative">
                    <img
                      loading="lazy"
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setImagePreview('')
                        setForm((f) => ({ ...f, featuredImage: '' }))
                      }}
                      className="absolute top-2 right-2 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <ImageIcon
                      size={40}
                      className="text-on-surface-variant/50 mb-3 group-hover:text-primary transition-colors"
                    />
                    <p className="text-on-surface font-semibold">
                      Click or drag to upload image
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
                >
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/45 bg-surface-container/70 text-on-surface outline-none focus:border-primary transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/45 bg-surface-container/70 text-on-surface outline-none focus:border-primary transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            {form.status === 'scheduled' && (
              <div>
                <label
                  htmlFor="publishedAt"
                  className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
                >
                  Publish Date
                </label>
                <input
                  type="date"
                  id="publishedAt"
                  name="publishedAt"
                  value={form.publishedAt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant/45 bg-surface-container/70 text-on-surface outline-none focus:border-primary transition-all"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-2"
              >
                Tags
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                  }
                  placeholder="Type and press Enter to add tags..."
                  className="flex-1 px-4 py-2 rounded-xl border border-outline-variant/45 bg-surface-container/70 text-on-surface placeholder:text-on-surface-variant outline-none focus:border-primary transition-all text-sm"
                />
                <Button
                  onClick={handleAddTag}
                  variant="outline"
                  className="px-6"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-primary/70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              variant="outline"
              className="px-6"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button
              onClick={() =>
                handleSubmit(
                  form.status === 'scheduled' ? 'scheduled' : 'published'
                )
              }
              disabled={loading}
              className="px-6"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : form.status === 'scheduled' ? (
                'Schedule'
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
