import {React, useEffect} from "react";

function Contributors(){

    useEffect(() => {            
        fetchData();
    }, []);

    const fetchData = async()=>{
        try{
            const response = await fetch('https://orkg.org/api/contributors/2e5f7de1-42e8-4f8a-97b2-f9880daa6a9a');
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("Contributors");
                console.log(result);
            }


        }catch(error){
            console.log(error);
        }
    }

    return(
        <div>Test Contributors</div>
    );
}

export default Contributors;