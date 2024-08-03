import React, { useState, useEffect } from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup'; 
import { useSelector } from 'react-redux';
import { useColorModes } from '@coreui/react';
import { CFormInput, CFormSelect, CFormTextarea, CButton, CTable, CTableBody, CTableHeaderCell, CTableRow, CTableDataCell } from '@coreui/react';
import '/src/scss/style.scss';

const DailyUpdate = () => {
    const [tableItems, setTableItems] = useState([]);
    const [updateIndex, setUpdateIndex] = useState(-1);
    const [items, setItems] = useState([]);
    const [horoscopes, setHoroscopes] = useState([
        {id: 1, name: "Aquarius"},
        {id: 2, name: "Aries"},
        {id: 3, name: "Cancer"},
        {id: 4, name: "Capricorn"},
        {id: 5, name: "Gemini"},
        {id: 6, name: "Leo"},
        {id: 7, name: "Libra"},
        {id: 8, name: "Pisces"},
        {id: 9, name: "Sagittarius"},
        {id: 10, name: "Scorpio"},
        {id: 11, name: "Taurus"},
        {id: 12, name: "Virgo"},
    ]);

    const validationSchema = Yup.object({
        date: Yup.date().required('Date is required'),
        name: Yup.string().oneOf(horoscopes.map(h => h.name), 'Invalid horoscope').required('Horoscope is required'),
        rating: Yup.number().min(1, 'Rating must be at least 1').max(10, 'Rating must be at most 10').required('Rating is required'),
        description: Yup.string().required('Description is required'),
    });

    useEffect(() => {
        setTableItems(
            items.map(m => ({
                id: m.id,
                name: m.name,
                rating: m.rating,
                description: m.description
            }))
        );
    }, [items]);

    const AddItems = (values, { resetForm }) => {
        if (updateIndex === -1) {
            if (items.findIndex(a => a.name === values.name) >= 0) {
                alert("Duplicate");
                return;
            }
            const newItem = { id: horoscopes.find(h => h.name === values.name).id, ...values };
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
        const itemToDelete = items[i];
        const updatedItems = [...items];
        updatedItems.splice(i, 1);
        setItems(updatedItems);
        setHoroscopes(prevHoroscopes => [
            ...prevHoroscopes.filter(h => h.id !== itemToDelete.id),
            { id: horoscopes.length + 1, name: itemToDelete.name }
        ]);
    };

    const createJsonFile = () => {
        const json = JSON.stringify(tableItems, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'horoscopeData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const tableitems = items.length;
    const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
    const storedTheme = useSelector((state) => state.theme);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
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

            {tableitems === 12 && (
                <CButton color="success" onClick={createJsonFile}>Submit</CButton>
            )}
        </>
    );
};

export default DailyUpdate;
