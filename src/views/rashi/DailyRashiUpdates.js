import React, { useState, useEffect } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useTable, useSortBy } from 'react-table';
import './rashi.css'; // Assuming you want to use the same styles

const horoscopes = [
    "Aquarius", "Aries", "Cancer", "Capricornus", "Gemini", "Leo",
    "Libra", "Pisces", "Sagittarius", "Scorpius", "Taurus", "Virgo"
];

const validationSchema = Yup.object().shape({
    date: Yup.date().required('Date is required'),
    horoscope: Yup.string().oneOf(horoscopes, 'Invalid horoscope').required('Horoscope is required'),
    rating: Yup.number()
        .typeError('Rating must be a number')
        .min(1, 'Rating must be at least 1')
        .max(10, 'Rating must be at most 10')
        .required('Rating is required'),
    description: Yup.string().required('Description is required')
});

const DailyRashiUpdates = () => {
    const [horoscopeData, setHoroscopeData] = useState([]);
    const [availableHoroscopes, setAvailableHoroscopes] = useState(horoscopes);
    const [updateIndex, setUpdateIndex] = useState(-1);

    useEffect(() => {
        // Any necessary side effects or setup
    }, []);

    const handleSubmit = (values, actions) => {
        if (updateIndex === -1) {
            if (horoscopeData.some(item => item.horoscope === values.horoscope)) {
                alert("Duplicate horoscope");
                return;
            }
            setHoroscopeData([...horoscopeData, values]);
            setAvailableHoroscopes(availableHoroscopes.filter(h => h !== values.horoscope));
        } else {
            if (horoscopeData.some((item, i) => item.horoscope === values.horoscope && i !== updateIndex)) {
                alert("Duplicate horoscope");
                return;
            }
            const updatedData = [...horoscopeData];
            updatedData[updateIndex] = values;
            setHoroscopeData(updatedData);
            setAvailableHoroscopes([...availableHoroscopes, horoscopeData[updateIndex].horoscope].filter(h => h !== values.horoscope));
            setUpdateIndex(-1);
        }
        actions.resetForm();
    };

    const handleDelete = (index, horoscope) => {
        const updatedData = [...horoscopeData];
        updatedData.splice(index, 1);
        setHoroscopeData(updatedData);
        setAvailableHoroscopes([...availableHoroscopes, horoscope].sort());
    };

    const handleEdit = (rowIndex) => {
        setUpdateIndex(rowIndex);
    };

    const handleSave = () => {
        setUpdateIndex(-1);
    };

    const handleCancel = (rowIndex) => {
        setUpdateIndex(-1);
    };

    const createJsonFile = () => {
        if (horoscopeData.length > 0) {
            const json = JSON.stringify(horoscopeData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'horoscopeData.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const columns = React.useMemo(
        () => [
            { Header: 'Horoscope', accessor: 'horoscope' },
            { Header: 'Description', accessor: 'description' },
            { Header: 'Rating', accessor: 'rating' },
            {
                Header: 'Action',
                Cell: ({ row }) => (
                    row.index === updateIndex ? (
                        <>
                            <button type='button' className='in-form-button save-button' onClick={handleSave}>Save</button>
                            <button type='button' className='in-form-button cancel-button' onClick={() => handleCancel(row.index)}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button type='button' className='in-form-button edit-button' onClick={() => handleEdit(row.index)}>Edit</button>
                            <button type='button' className='in-form-button delete-button' onClick={() => handleDelete(row.index, row.original.horoscope)}>Delete</button>
                        </>
                    )
                )
            }
        ],
        [updateIndex]
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable(
        {
            columns,
            data: horoscopeData
        },
        useSortBy
    );

    return (
        <Formik
            initialValues={{
                date: new Date().toISOString().substr(0, 10),
                horoscope: '',
                rating: '',
                description: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ isSubmitting, values, handleChange, handleBlur }) => (
                <Form>
                    <div className='outer-div'>
                        <div className='outer-header'>
                            <h1 className='heading'>Daily Horoscope</h1>
                        </div>
                        <div className='inner-div'>
                            <div className='date-bar'>
                                <Field type='date' name='date' className='input-box' />
                            </div>
                            <div className='rashi-rating'>
                                <Field as='select' name='horoscope' id='horoscope' className='input-box'>
                                    <option value=''>Select Horoscope</option>
                                    {availableHoroscopes.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </Field>
                                <ErrorMessage name='horoscope' component='div' className='error-message' />
                                <Field type='text' name='rating' placeholder='Rating (1-10)' className='input-box' />
                                <ErrorMessage name='rating' component='div' className='error-message' />
                            </div>
                            <div className='description'>
                                <Field as='textarea' name='description' placeholder='Description' rows='8' className='textfield' />
                                <ErrorMessage name='description' component='div' className='error-message' />
                                <div className='clear-add'>
                                    <button type='button' className='in-form-button clear-button' onClick={() => {
                                        handleChange({ target: { name: 'horoscope', value: '' } });
                                        handleChange({ target: { name: 'rating', value: '' } });
                                        handleChange({ target: { name: 'description', value: '' } });
                                    }}>Clear</button>
                                    <button type='submit' className='in-form-button add-button'>
                                        {updateIndex === -1 ? "Add" : "Update"}
                                    </button>
                                </div>
                            </div>
                            <div className='tablediv'>
                                <table {...getTableProps()} className='table'>
                                    <thead>
                                        {headerGroups.map(headerGroup => (
                                            <tr {...headerGroup.getHeaderGroupProps()}>
                                                {headerGroup.headers.map(column => (
                                                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                                        {column.render('Header')}
                                                        <span>
                                                            {column.isSorted
                                                                ? column.isSortedDesc
                                                                    ? ' 🔽'
                                                                    : ' 🔼'
                                                                : ''}
                                                        </span>
                                                    </th>
                                                ))}
                                            </tr>
                                        ))}
                                    </thead>
                                    <tbody {...getTableBodyProps()}>
                                        {rows.map(row => {
                                            prepareRow(row);
                                            return (
                                                <tr {...row.getRowProps()}>
                                                    {row.cells.map(cell => (
                                                        <td {...cell.getCellProps()}>
                                                            {cell.column.id === 'horoscope' ? cell.value : cell.render('Cell')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className='submitdiv'>
                                <button type='button' className='in-form-button submit-button' onClick={createJsonFile}>Submit</button>
                            </div>
                        </div>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

export default DailyRashiUpdates;
