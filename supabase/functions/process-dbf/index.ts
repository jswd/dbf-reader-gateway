import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { fileName, filePath } = await req.json()

    console.log(`Processing DBF file: ${fileName} at path: ${filePath}`)

    // Verificar si ya existe una tabla con ese nombre
    const tableName = `ieasalvay_dbf_${fileName.toLowerCase().replace('.dbf', '')}`
    
    const { data: existingTable, error: tableCheckError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', tableName)
      .single()

    if (tableCheckError) {
      console.error('Error checking table existence:', tableCheckError)
      return new Response(
        JSON.stringify({ error: 'Error checking table existence' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    if (existingTable) {
      return new Response(
        JSON.stringify({ error: 'Este archivo DBF ha sido convertido, valide Supabase' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Registrar la conversión
    const { error: conversionError } = await supabase
      .from('ieasalvay_conversion')
      .insert({
        original_filename: fileName,
        table_name: tableName,
        records_count: 0, // Se actualizará después
        status: 'processing'
      })

    if (conversionError) {
      console.error('Error registering conversion:', conversionError)
      return new Response(
        JSON.stringify({ error: 'Error registering conversion' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // TODO: Implementar la lógica de conversión DBF a PostgreSQL
    // Por ahora solo simulamos éxito
    
    return new Response(
      JSON.stringify({ success: true, tableName }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})