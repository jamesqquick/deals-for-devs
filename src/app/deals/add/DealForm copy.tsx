'use client'
import CategorySelect from '@/components/forms/CategorySelect'
import { DatePickerWithRange } from '@/components/forms/DatePicker'
import DragAndDropImage from '@/components/forms/add-a-deal/DragAndDropImage'
import { Category, FORM_DEAL_SCHEMA } from '@/types/Types'
import { addDays } from 'date-fns'
import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useRouter } from 'next/navigation'

export default function DealForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>()
  const [file, setFile] = useState<File | undefined>()
  const [nameCharacterCount, setNameCharacterCount] = useState<number>(0)
  const [descriptionCharacterCount, setDescriptionCharacterCount] =
    useState<number>(0)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  })
  const [category, setCategory] = useState<Category | undefined>(
    Category.COURSE
  )

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameCharacterCount(e.target.value?.length || 0)
  }
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptionCharacterCount(e.target.value?.length || 0)
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    let newDeal
    try {
      newDeal = {
        name: formData.get('name'),
        link: formData.get('link'),
        description: formData.get('description'),
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        coupon: formData.get('coupon'),
        couponPercent: Number(formData.get('couponPercent')),
        email: formData.get('email'),
        category,
      }
      newDeal = FORM_DEAL_SCHEMA.parse(newDeal)
    } catch (error) {
      console.log('failed to parse')
      console.error(error)
      return new Response('Bad Request', { status: 400 })
    }

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        body: JSON.stringify(newDeal),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.ok) {
        const createdDeal = await res.json()
        const { image } = createdDeal
        const { uploadUrl } = image
        try {
          const res = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
          })
          console.log(res)
          if (res.ok) {
            console.log('uploaded')
            router.push('/thank-you')
          } else {
            setError('Image upload failed')
          }
        } catch (error) {
          setError(error)
          console.error(error)
        }
      }
    } catch (error) {
      console.error(error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <h2 className="pb-4 text-2xl font-bold text-white">Media</h2>

        <div>
          <label
            className=" text-md mb-1 block font-bold text-gray-200"
            htmlFor="image"
            aria-label="image"
          >
            Cover Image
          </label>

          <DragAndDropImage onFileChange={setFile} />
        </div>

        <h2 className="pb-4 pt-10  text-2xl font-bold text-white">
          Product Details
        </h2>

        <div className="flex flex-col gap-y-6">
          <div>
            <div className="flex justify-between">
              <label
                className=" text-md mb-1 block font-bold text-gray-300"
                htmlFor="name"
                aria-label="Name"
              >
                Name
              </label>
              <span className="text-gray-400">{nameCharacterCount}/40</span>
            </div>
            <input
              className="w-full appearance-none rounded-lg border-2 border-gray-700 bg-transparent px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:ring focus:ring-teal-300 "
              name="name"
              id="name"
              type="text"
              required
              onChange={onNameChange}
              maxLength={40}
            />
          </div>
          <div className="relative">
            <label
              className=" text-md mb-1 block font-bold text-gray-300"
              htmlFor="category"
              aria-label="category"
            >
              Category
            </label>
            <CategorySelect onCategoryChange={setCategory} />
            {/* <FaCaretDown className="absolute cursor-pointer bottom-3 right-2 text-gray-300" /> */}
          </div>
          <div>
            <label
              className=" text-md mb-1 block font-bold text-gray-300"
              htmlFor="link"
              aria-label="Link"
            >
              Link
            </label>
            <input
              className="w-full appearance-none rounded-lg border-2 border-gray-700 bg-transparent px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:ring focus:ring-teal-300 "
              name="link"
              id="link"
              type="text"
              required
            />
          </div>
          <div>
            <div className="flex justify-between">
              <label
                className=" text-md mb-1 block font-bold text-gray-300"
                htmlFor="description"
                aria-label="description"
              >
                Description
              </label>
              <span className="text-gray-400">
                {descriptionCharacterCount}/240
              </span>
            </div>
            <textarea
              className="w-full appearance-none rounded-lg border-2 border-gray-700 bg-transparent px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:ring focus:ring-teal-300 "
              name="description"
              id="description"
              rows={3}
              required
              onChange={onDescriptionChange}
              maxLength={240}
            />
          </div>
        </div>
        <h2 className="pb-4 pt-10  text-2xl font-bold text-white">
          Coupon Details
        </h2>

        <div className="flex flex-col gap-y-6">
          <div>
            <label
              className=" text-md mb-1 block font-bold text-gray-300"
              htmlFor="coupon"
              aria-label="Coupon"
            >
              Dates
            </label>

            <DatePickerWithRange
              initialFrom={new Date()}
              initialTo={addDays(new Date(), 7)}
              onDateRangeChange={setDateRange}
            />
          </div>
          {/* <div className="flex gap-x-4">
            <div className="grow">
              <label
                className=" text-gray-300 text-md font-bold mb-1 block"
                htmlFor="startDate"
                aria-label="startDate"
              >
                Start date
              </label>
              <input
                className="shadow appearance-none border-2 border-gray-700 rounded-lg w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:ring focus:ring-teal-300 bg-transparent "
                name="startDate"
                id="startDate"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                type="date"
              />
            </div>
            <div className="grow">
              <label
                className="text-gray-300 text-md font-bold mb-1 block"
                htmlFor="endDate"
                aria-label="endDate"
              >
                End date
              </label>
              <input
                className="shadow appearance-none border-2 border-gray-700 rounded-lg w-full py-2 px-3 text-gray-300 leading-tight focus:outline-none focus:ring focus:ring-teal-300 bg-transparent "
                name="endDate"
                id="endDate"
                defaultValue={new Date().toISOString().split('T')[0]}
                required
                type="date"
              ></input>
            </div>
          </div> */}
          <div>
            <div className="flex justify-between">
              <label
                className=" text-md mb-1 block font-bold text-gray-300"
                htmlFor="coupon"
                aria-label="Coupon"
              >
                Coupon Code
              </label>
              <span className="text-gray-400">optional</span>
            </div>
            <input
              className="w-full appearance-none rounded-lg border-2 border-gray-700 bg-transparent px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:ring focus:ring-teal-300 "
              name="coupon"
              id="coupon"
              type="text"
            />
          </div>
          <div>
            <div className="flex justify-between">
              <label
                className=" text-md mb-1 block font-bold text-gray-300"
                htmlFor="couponPercent"
                aria-label="couponPercent"
              >
                Coupon Percentage (0-100)
              </label>
              <span className="text-gray-400">optional</span>
            </div>
            <input
              className="w-full appearance-none rounded-lg border-2 border-gray-700 bg-transparent px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:ring focus:ring-teal-300 "
              name="couponPercent"
              id="couponPercent"
              type="number"
            />
          </div>
        </div>

        <h2 className="pb-4 pt-10  text-2xl font-bold text-white">
          Contact Details
        </h2>

        <div className="flex flex-col gap-y-6">
          <div>
            <label
              className=" text-md mb-1 block font-bold text-gray-300"
              htmlFor="contactName"
              aria-label="contactName"
            >
              Name
            </label>
            <input
              className="w-full appearance-none rounded-lg border-2 border-gray-700 bg-transparent px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:ring focus:ring-teal-300 "
              name="contactName"
              id="contactName"
              type="text"
              required
            />
          </div>
          <div>
            <label
              className=" text-md mb-1 block font-bold text-gray-300"
              htmlFor="email"
              aria-label="email"
            >
              Email
            </label>
            <input
              className="w-full appearance-none rounded-lg border-2 border-gray-700 bg-transparent px-3 py-2 leading-tight text-gray-300 shadow focus:outline-none focus:ring focus:ring-teal-300 "
              name="email"
              id="email"
              type="text"
              required
              aria-label="email"
            />
          </div>
        </div>

        <div className="pt-10">
          <button
            className="focus:shadow-outline w-32 rounded-lg bg-gray-800 px-4 py-2 font-bold text-white hover:bg-gray-700 focus:outline-none disabled:bg-gray-500"
            disabled={loading}
          >
            Submit {loading && '...'}
          </button>
        </div>
      </form>
    </div>
  )
}
