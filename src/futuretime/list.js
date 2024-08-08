import React, { useEffect, useState, createContext } from 'react';
import { CButton, CTable, CTableBody, CTableHeaderCell, CTableRow, CTableDataCell } from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useUrl } from '../contexts/UrlContext';

const List = () => {
    const [items, setItems] = useState([]);
    const navigate = useNavigate();
    const url = useUrl(); 

    useEffect(()=>{
        fetch("http://13.202.94.163:7001/DailyRashiUpdates/getalllist") 
        .then(response => {
        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        // Parse the JSON from the response
            return response.json();
        })
        .then(data1 => {
            setItems(data1.data.list)
        })
        .catch(error => {
        // Handle any errors that occur during the fetch operation
        console.error('There was a problem with the fetch operation:', error);
        });
    },[])

    // const DateContext = createContext();

    useEffect(() => {
        const fetchItems = async () => {
            const response = await fetch(`${url}/api/items`);
            const data = await response.json();
            setItems(data);
        };

        fetchItems();
    }, [url]);

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
                            <CTableRow key={item.id}>
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
