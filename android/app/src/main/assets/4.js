
{/* <link rel='stylesheet' href='./formio/dist/formio.full.min.css'>
            <script src='./formio/dist/formio.full.min.js'></script> */}

module.exports = function() { return `
    <html>
        <head>
            <title>Page Title</title>
            <link rel='stylesheet' href='formio.full.css'>
            <script src='./formio.full.js'></script>
            <script type='text/javascript'>
              window.onload = function() {
                alert(typeof Formio)
                alert('test ok')
                const json = '{"display":"form","settings":{"pdf":{"id":"1ec0f8ee-6685-5d98-a847-26f67b67d6f0","src":"https://files.form.io/pdf/5692b91fd1028f01000407e3/file/1ec0f8ee-6685-5d98-a847-26f67b67d6f0"}},"components":[{"label":"Owner name","tableView":true,"key":"ownerName","type":"textfield","input":true},{"label":"Tenant name","tableView":true,"key":"tenantName","type":"textfield","input":true},{"label":"Description","autoExpand":false,"tableView":true,"key":"description","type":"textarea","input":true},{"label":"Upload photo","tableView":false,"image":true,"webcam":true,"fileTypes":[{"label":"","value":""}],"key":"uploadPhoto","type":"file","input":true},{"label":"Form letter details","attrs":[{"attr":"","value":""}],"refreshOnChange":false,"key":"formLetterDetails","type":"htmlelement","input":false,"tableView":false},{"type":"button","label":"Submit","key":"submit","disableOnInvalid":true,"input":true,"tableView":false}]}'
                Formio.createForm(document.getElementById('formio'), 
                {"display":"form","settings":{"pdf":{"id":"1ec0f8ee-6685-5d98-a847-26f67b67d6f0","src":"https://files.form.io/pdf/5692b91fd1028f01000407e3/file/1ec0f8ee-6685-5d98-a847-26f67b67d6f0"}},"components":[{"label":"Owner name","tableView":true,"key":"ownerName","type":"textfield","input":true},{"label":"Tenant name","tableView":true,"key":"tenantName","type":"textfield","input":true},{"label":"Description","autoExpand":false,"tableView":true,"key":"description","type":"textarea","input":true},{"label":"Upload photo","tableView":false,"image":true,"webcam":true,"fileTypes":[{"label":"","value":""}],"key":"uploadPhoto","type":"file","input":true},{"label":"Form letter details","attrs":[{"attr":"","value":""}],"refreshOnChange":false,"key":"formLetterDetails","type":"htmlelement","input":false,"tableView":false},{"type":"button","label":"Submit","key":"submit","disableOnInvalid":true,"input":true,"tableView":false}]}
                );
              };
            </script>
        </head>
        <body>
            <h1>My First Heading</h1>
            <p>My first paragraph.</p>
            <h1>aaaaa</h1>
            <div id='formio'></div>
            
        </body>
    </html>
`};
