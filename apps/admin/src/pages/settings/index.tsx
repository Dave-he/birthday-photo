import { useEffect } from "react"
import { useNavigate } from "react-router";
import { supabaseClient } from "../../utility/supabaseClient"

export const SettingsIndex: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true
    const run = async () => {
      const { data } = await supabaseClient
        .from("settings")
        .select("id")
        .limit(1)
        .maybeSingle()
      if (!mounted) return
      if (data?.id) {
        navigate(`/settings/edit/${data.id}`, { replace: true })
      } else {
        const { data: created } = await supabaseClient
          .from("settings")
          .insert({})
          .select("id")
          .single()
        if (created?.id) navigate(`/settings/edit/${created.id}`, { replace: true })
      }
    }
    run()
    return () => { mounted = false }
  }, [navigate])

  return null
}
