import { supabase } from '@/lib/supabase';

export async function getTableSchema() {
  try {
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);
      return null;
    }

    console.log('📊 Database Tables:', tables);

    // Get detailed schema for each table
    const schemaInfo = {};
    
    for (const table of tables || []) {
      const tableName = table.table_name;
      
      // Get columns for this table
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select(`
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        `)
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');

      if (!columnsError && columns) {
        schemaInfo[tableName] = columns;
      }
    }

    return {
      tables: tables?.map(t => t.table_name) || [],
      schema: schemaInfo
    };

  } catch (error) {
    console.error('Schema inspection failed:', error);
    return null;
  }
}

export async function inspectSpecificTable(tableName: string) {
  try {
    // Get sample data
    const { data: sampleData, error: dataError } = await supabase
      .from(tableName)
      .select('*')
      .limit(3);

    // Get column info
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select(`
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      `)
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .order('ordinal_position');

    return {
      tableName,
      columns: columns || [],
      sampleData: sampleData || [],
      errors: { dataError, columnsError }
    };

  } catch (error) {
    console.error(`Error inspecting table ${tableName}:`, error);
    return null;
  }
}
