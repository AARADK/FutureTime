import React, { useState, useEffect, createContext } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useColorModes } from '@coreui/react';
import { CFormInput, CFormSelect, CFormTextarea, CButton, CTable, CTableBody, CTableHeaderCell, CTableRow, CTableDataCell } from '@coreui/react';
import '/src/scss/style.scss';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUrl } from '../contexts/UrlContext';

const DailyUpdate = () => {
    const [tableItems, setTableItems] = useState([]);
    const [updateIndex, setUpdateIndex] = useState(-1);
    const [items, setItems] = useState([]);
    const [horoscopes, setHoroscopes] = useState([]);

    useEffect(()=>{
        fetch("http://13.202.94.163:7001/DailyRashiUpdates/LoadBaseData") 
        .then(response => {
        // Check if the response status is OK (status code 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        // Parse the JSON from the response
            return response.json();
        })
        .then(data => {
            setHoroscopes(data.data.rashi)
        })
        .catch(error => {
        // Handle any errors that occur during the fetch operation
        console.error('There was a problem with the fetch operation:', error);
        });
    },[])

    const validationSchema = Yup.object({
        date: Yup.date().required('Date is required'),
        name: Yup.string().oneOf(horoscopes.map(h => h.name), 'Invalid horoscope').required('Horoscope is required'),
        rating: Yup.number().min(1, 'Rating must be at least 1').max(10, 'Rating must be at most 10').required('Rating is required'),
        description: Yup.string().required('Description is required'),
    });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');

        if (id) {
            const item = items.find(item => item.id === parseInt(id));
            if (item) {
                setUpdateIndex(items.indexOf(item));
            }
        }
    }, [items]);

    useEffect(() => {
        setTableItems(items.map(m => ({
            id: m.id,
            date: m.date,
            name: m.name,
            rating: m.rating,
            description: m.description
        })));
    }, [items]);

    const navigate = useNavigate();
    const url = useUrl(); // Use the URL context

    const AddItems = (values, { resetForm }) => {
        if (updateIndex === -1) {
            if (items.findIndex(a => a.name === values.name) >= 0) {
                alert("Duplicate");
                return;
            }
            const newItem = { id: Date.now(), ...values };
            setItems(prevItems => [...prevItems, newItem]);
        } else {
            const currentItem = items[updateIndex];
            if (items.findIndex(a => a.name === values.name && a.id !== currentItem.id) >= 0) {
                alert("Duplicate");
                return;
            }
            const updatedItems = [...items];
            updatedItems[updateIndex] = values;
            setItems(updatedItems);
        }
        setUpdateIndex(-1);
        resetForm();
    };

    const Edit = (i, setValues) => {
        const a = items[i];
        setUpdateIndex(i);
        setValues({
            date: a.date,
            name: a.name || '',
            rating: a.rating || '',
            description: a.description || ''
        });
    };

    const DeleteItem = (i) => {
        const updatedItems = [...items];
        updatedItems.splice(i, 1);
        setItems(updatedItems);
    };

    const updateList = () => {
        navigate('/dailyupdate/list');
    }

    const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
    const storedTheme = useSelector((state) => state.theme);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
        if (theme) {
            setColorMode(theme);
        }

        if (isColorModeSet()) {
            return;
        }

        setColorMode(storedTheme);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <Formik
                initialValues={{
                    date: new Date().toISOString().substring(0, 10),
                    id: '',
                    name: '',
                    rating: '',
                    description: ''
                }}
                validationSchema={validationSchema}
                onSubmit={AddItems}
            >
                {({ handleSubmit, errors, touched, setValues }) => (
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="date">Date</label>
                            <Field as={CFormInput} type='date' id='date' name='date' />
                            {errors.date && touched.date && <div className="text-danger">{errors.date}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name">Horoscope</label>
                            <Field as={CFormSelect} name="name" id="name" disabled={updateIndex !== -1}>
                                <option value="">Select Horoscope</option>
                                {horoscopes.slice().sort((a,b) => a.name.localeCompare(b.name)).map(h => (
                                    <option key={h.id} value={h.name}>{h.name}</option>
                                ))}
                            </Field>
                            {errors.name && touched.name && <div className="text-danger">{errors.name}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="rating">Rating</label>
                            <Field as={CFormInput} type="number" id="rating" name="rating" />
                            {errors.rating && touched.rating && <div className="text-danger">{errors.rating}</div>}
                        </div>
                        <div className="mb-3">
                            <label htmlFor="description">Description</label>
                            <Field as={CFormTextarea} id="description" name="description" />
                            {errors.description && touched.description && <div className="text-danger">{errors.description}</div>}
                        </div>
                        <CButton type="submit" color="primary">
                            {updateIndex === -1 ? "Add" : "Update"}
                        </CButton>
                    </Form>
                )}
            </Formik>

            <CTable hover>
                <thead>
                    <CTableRow>
                        <CTableHeaderCell>Horoscope</CTableHeaderCell>
                        <CTableHeaderCell>Rating</CTableHeaderCell>
                        <CTableHeaderCell>Description</CTableHeaderCell>
                        <CTableHeaderCell>Action</CTableHeaderCell>
                    </CTableRow>
                </thead>
                <CTableBody>
                    {items.map((m, i) => (
                        <CTableRow key={i}>
                            <CTableDataCell>{m.name}</CTableDataCell>
                            <CTableDataCell>{m.rating}</CTableDataCell>
                            <CTableDataCell>{m.description}</CTableDataCell>
                            <CTableDataCell>
                                <CButton color="warning" onClick={() => Edit(i, setValues)}>Edit</CButton>
                                <CButton color="danger" onClick={() => DeleteItem(i)}>Delete</CButton>
                            </CTableDataCell>
                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>
            {tableItems.length === 12 && (
                <CButton color="success" onClick={updateList}>Submit</CButton>
            )}
        </>
    );
};

export default DailyUpdate;
