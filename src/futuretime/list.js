import React, { useEffect, useState, createContext } from 'react';
import { CButton, CTable, CTableBody, CTableHeaderCell, CTableRow, CTableDataCell } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useUrl } from '../contexts/UrlContext';

const List = () => {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();
    const url = useUrl(); 

    useEffect(() => {
        fetch('http://52.66.24.172:7001/DailyRashiUpdates/GetAllList')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.error_code === "0" && data.data && data.data.list) {
                setItems(data.data.list);
            } else {
                console.error('Unexpected data structure:', data);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
        }, []);

    const handleEdit = (id) => {
        navigate(`/dailyupdate/manage?id=${id}`);
    };

    return (
        <>
            {/* <DateContext.Provider value={date}> */}
                <CButton color="primary" onClick={() => navigate('/dailyupdate/manage')}>
                    Manage
                </CButton>

                <CTable hover>
                    <thead>
                        <CTableRow>
                            <CTableHeaderCell>Date</CTableHeaderCell>
                            <CTableHeaderCell>Actions</CTableHeaderCell>
                        </CTableRow>
                    </thead>
                    <CTableBody>
                        {items.map((item) => (
                            <CTableRow key={item._id}>
                                <CTableDataCell>{item.transaction_date}</CTableDataCell>
                                <CTableDataCell>
                                    <CButton color="warning" onClick={() => handleEdit(item._id)}>Edit</CButton>
                                </CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            {/* </DateContext.Provider> */}
        </>
    );
};

export default List;
