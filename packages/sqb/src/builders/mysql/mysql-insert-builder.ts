import { MySqlSelectBuilder } from './mysql-select-builder';

class InsertQuery {
  table: string = '';
  fields: string[] = [];
  values: any[][] = [];
  ignore: boolean = false;
  selectQuery: string = '';
}

export class MysqlInsertBuilder {
  #query = new InsertQuery();

  protected mergeQuery(query: Partial<InsertQuery>) {
    this.#query.table = query.table || '';
    this.#query.fields.push(...(query.fields || []));
    this.#query.values.push(...(query.values || []));
    this.#query.ignore = query.ignore || false;
    this.#query.selectQuery = query.selectQuery || '';
    return this.#query;
  }

  insertFromValues(table: string, fields: string[], values: any[][]): MysqlInsertBuilder;
  insertFromValues(
    table: string,
    fields: string[],
    valuesCallback: (valuesBuilder: ValuesBuilder) => ValuesBuilder
  ): MysqlInsertBuilder;
  insertFromValues(
    table: string,
    fields: string[],
    arrayOrCallback: any[][] | ((valuesBuilder: ValuesBuilder) => ValuesBuilder)
  ) {
    const insertBuilder = new MysqlInsertBuilder();
    const insertQuery = insertBuilder.mergeQuery(this.#query);
    insertQuery.table = table;
    insertQuery.fields.push(...fields);
    if (Array.isArray(arrayOrCallback)) {
      insertQuery.values.push(...arrayOrCallback);
    } else {
      insertQuery.values.push(...arrayOrCallback(new ValuesBuilder()));
    }
    return insertBuilder;
  }

  insertFromSelect(
    table: string,
    fields: string[],
    selectCallback: (selectBuilder: MySqlSelectBuilder) => MySqlSelectBuilder
  ) {
    const insertBuilder = new MysqlInsertBuilder();
    const insertQuery = insertBuilder.mergeQuery(this.#query);
    insertQuery.table = table;
    insertQuery.fields.push(...fields);
    insertQuery.selectQuery = selectCallback(new MySqlSelectBuilder()).toString();
    return insertBuilder;
  }

  ignore() {
    const insertBuilder = new MysqlInsertBuilder();
    insertBuilder.mergeQuery(this.#query).ignore = true;
    return insertBuilder;
  }

  onDuplicateKeyUpdate(table: string) {}

  toString(): string {
    const { table, fields, ignore, values, selectQuery } = this.#query;
    let sql = '';

    if (table) {
      sql += 'insert';
      if (ignore) {
        sql += ' ignore';
      }
      sql += ` into ${table}`;
    }
    if (fields.length) {
      sql += ` (\n  ${fields.join(',\n  ')}\n)`;
    }
    if (values.length) {
      sql += `\nvalues (${values.map((v) => v.join(', ')).join('), (')})`;
    } else if (selectQuery.length) {
      sql += `\n${selectQuery}`;
    }
    return sql;
  }
}

class ValuesBuilder {
  protected rows: any[][] = [];
  protected index = -1;

  row(...row: any[]): ValuesBuilder {
    const b = new ValuesBuilder();
    b.rows.push(...this.rows, row);
    return b;
  }

  protected [Symbol.iterator]() {
    return this;
  }

  protected next() {
    return { value: this.rows[++this.index], done: !(this.index in this.rows) };
  }
}
