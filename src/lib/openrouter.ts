const mgt_key = process.env.OPENROUTER_MGT_KEY!

const BASE = 'https://openrouter.ai/api/v1/keys'

export async function create_key(name: string, limit: number) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mgt_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, limit }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('OR_CREATE_FAILED', err)
    throw new Error('OR_CREATE_FAILED')
  }
  const json = await res.json()
  return {
    hash: json.data.hash,
    label: json.data.label,
    key: json.key
  }
}

export async function update_key(hash: string, limit: number) {
  const res = await fetch(`${BASE}/${hash}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${mgt_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ limit }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('OR_UPDATE_FAILED', err)
    throw new Error('OR_UPDATE_FAILED')
  }
  const json = await res.json()
  return json.data
}

export async function get_key(hash: string) {
  const res = await fetch(`${BASE}/${hash}`, {
    headers: {
      Authorization: `Bearer ${mgt_key}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('OR_GET_FAILED', err)
    throw new Error('OR_GET_FAILED')
  }
  const json = await res.json()
  return json.data
}

export async function delete_key(hash: string) {
  const res = await fetch(`${BASE}/${hash}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${mgt_key}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('OR_DELETE_FAILED', err)
    throw new Error('OR_DELETE_FAILED')
  }
}
