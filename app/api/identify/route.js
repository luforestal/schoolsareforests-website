export async function POST(request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image')

    const plantNetForm = new FormData()
    plantNetForm.append('images', image)
    plantNetForm.append('organs', 'auto')

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
