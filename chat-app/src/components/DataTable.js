import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TableSortLabel,
  TablePagination,
  TextField,
  TableContainer,
} from '@mui/material';
import { KeyboardArrowUp, KeyboardArrowDown } from '@mui/icons-material';

const DataTable = ({ columns, rows, actionButton = () => {}, detailPageLink, actionButtonText, searchableFields = [] }) => {
  
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  if (typeof searchQuery !== 'string') {
    console.error('searchQuery must be a string, but got:', typeof searchQuery);
    return [];
  }
  
  if (!Array.isArray(searchableFields)) {
    console.error('searchableFields must be an array, but got:', typeof searchableFields);
    return [];
  }
  
  // Ensure all fields in searchableFields actually exist in the rows.
  const validSearchableFields = searchableFields.every(field => rows.some(row => field in row));
  if (!validSearchableFields) {
    console.error('searchableFields contains invalid field names:', searchableFields);
    return [];
  }
  
  const filteredRows = searchableFields.length > 0 ? rows.filter((row) => {
    return searchableFields.some((field) => {
      return row[field] && row[field].toString().toLowerCase().includes(searchQuery.toLowerCase());
    });
  }) : rows;
  
  




  const sortedRows = filteredRows.sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

    if (valueA < valueB) {
      return sortOrder === 'asc' ? -1 : 1;
    } else if (valueA > valueB) {
      return sortOrder === 'asc' ? 1 : -1;
    } else {
      return 0;
    }
  });

  const paginatedRows = sortedRows.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  );

  return (
    <div>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={handleSearch}
        sx={{ marginBottom: '1rem' }}
      />
       <TableContainer style={{maxWidth: '100%', overflowX: 'auto'}}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.field}
                sx={{ cursor: 'pointer', fontWeight: 'bold' }}
              >
                <TableSortLabel
                  active={sortField === column.field}
                  direction={sortField === column.field ? sortOrder : 'asc'}
                  onClick={() => handleSort(column.field)}
                >
                  {column.headerName}
                  {sortField === column.field && (
                    <KeyboardArrowUp
                      fontSize="small"
                      sx={{
                        visibility: sortOrder === 'asc' ? 'visible' : 'hidden',
                      }}
                    />
                  )}
                  {sortField === column.field && (
                    <KeyboardArrowDown
                      fontSize="small"
                      sx={{
                        visibility: sortOrder === 'desc' ? 'visible' : 'hidden',
                      }}
                    />
                  )}
                </TableSortLabel>
              </TableCell>
            ))}
              {actionButtonText && <TableCell>Action</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedRows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell key={column.field}>{row[column.field]}</TableCell>
              ))}
               <TableCell>
            {actionButton(row)}
          </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedRows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </div>
  );
};

export default DataTable;
