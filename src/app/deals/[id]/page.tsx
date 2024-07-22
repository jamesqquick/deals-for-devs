import { notFound } from 'next/navigation'
import { getApprovedDeals, getDealById } from '@/lib/queries'
import DealPreview from '@/components/DealPreview'
import { Metadata, ResolvingMetadata } from 'next'

export const revalidate = 120

type Props = {
  params: { id: string }
}

export const dynamicParams = true

export async function generateStaticParams() {
  const deals = await getApprovedDeals()

  return deals.map((deal) => ({
    id: deal.xata_id,
  }))
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id

  // fetch data
  const deal = await getDealById(params.id)

  if (!deal) {
    return {
      title: 'Deal not found',
    }
  }

  return {
    title: deal?.name,
    description: deal?.description,
    openGraph: {
      images: [deal?.coverImageURL || '/logo-wide.png'],
    },
  }
}

export default async function DealPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    //not found
  }
  const deal = await getDealById(params.id)
  if (!deal) {
    notFound()
  }

  return (
    <main>
      <div className="pb-10">
        <DealPreview
          name={deal.name}
          link={deal.link}
          coupon={deal.coupon}
          couponPercent={deal.couponPercent}
          coverImageURL={deal.coverImageURL}
          startDate={deal.startDate}
          endDate={deal.endDate || undefined}
          category={deal.category}
          description={deal.description}
        />
      </div>
    </main>
  )
}
