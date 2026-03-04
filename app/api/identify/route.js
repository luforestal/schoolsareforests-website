export async function POST(request) {
  try {
    const formData = await request.formData()
    const images = formData.getAll('images')

    const plantNetForm = new FormData()
    const organs = ['auto', 'bark', 'leaf']
    images.forEach((img, i) => {
      plantNetForm.append('images', img)
      plantNetForm.append('organs', organs[i] || 'auto')
    })

    const res = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_API_KEY}&lang=en&include-related-images=false`,
      { method: 'POST', body: plantNetForm }
    )

    const data = await res.json()
    return Response.json(data, { status: res.status })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
