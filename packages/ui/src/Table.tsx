import { ReactNode } from "react";
import "./table.css";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
};

export function Table<T>({ columns, rows, emptyMessage = "Nenhum registro encontrado." }: TableProps<T>) {
  return (
    <div className="pulso-table-shell">
      <table className="pulso-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="pulso-table__empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
