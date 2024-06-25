import { MouseEventHandler, useCallback, useState } from "react";
import {Table, Button} from 'react-bootstrap';

function sortData({
  tableData,
  sortKey,
  reverse,
}) {
  if (!sortKey) return tableData;

  const sortedData = tableData.sort((a, b) => {
    return a[sortKey] > b[sortKey] ? 1 : -1;
  });

  if (reverse) {
    return sortedData.reverse();
  }

  return sortedData;
}

function SortButton({sortOrder, columnKey,sortKey, onClick}) {
  return <Button variant="outline-primary" style={{float:'right'}} onClick={onClick} className={(sortKey === columnKey && sortOrder === "desc") ? "sort-button sort-reverse" : "sort-button" } >
       ▲
     </Button>
}

//   const headers: { key: SortKeys; label: string }[] = [
//     { key: "id", label: "ID" },
//     { key: "first_name", label: "First name" },
//     { key: "last_name", label: "Last name" },
//     { key: "email", label: "Email" },
//     { key: "gender", label: "Gender" },
//     { key: "ip_address", label: "IP address" },
//   ];


function SortableTable({ data , headers}) {
  const [sortKey, setSortKey] = useState("last_name");
  const [sortOrder, setSortOrder] = useState("ascn");
  // console.log("STTTSST",data,headers)

  const sortedData = useCallback(
    () => sortData({ tableData: data, sortKey, reverse: sortOrder === "desc" }),
    [data, sortKey, sortOrder]
  );

  function changeSort(key) {
    setSortOrder(sortOrder === "ascn" ? "desc" : "ascn");

    setSortKey(key);
  }

  return (
    <Table  striped bordered hover>
      <thead>
        <tr>
          {headers.map((row) => {
            return (
              <td key={row.key}>
                {row.label}{" "}
                <SortButton
                  columnKey={row.key}
                  onClick={() => changeSort(row.key)}
                  {...{
                    sortOrder,
                    sortKey,
                  }}
                />
              </td>
            );
          })}
        </tr>
      </thead>

      <tbody>
        {sortedData().map((person) => {
          return (
            <tr key={person.id}>
              {headers.map((row, rk) => {
                return <td key={rk}>{row && row.key && person[row.key] ? person[row.key] : ''}</td>
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}

export default SortableTable;