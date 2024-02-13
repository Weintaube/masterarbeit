import {React, useEffect} from "react";

function Observatories(){

    const [rawObservatories, setRawObservatories] = useState([]);

    useEffect(() => {            
        fetchData();
    }, []);

    useEffect(()=>{
        


    },[rawObservatories]);

    const fetchData = async()=>{
        try{
            const response = await fetch('https://orkg.org/api/observatories/');
            if(response.ok){ //Anfrage erfolgreich Statuscode 200
                console.log("Response (OK)",  response)
                const result = await response.json();
                console.log("Observatories", result);
                setRawObservatories(result);

            }else{
                console.log("Error while fetching comparisons.");
            }

        }catch(error){
            console.log(error);
        }
    }

    return(
        <div>Test Contributors</div>
    );
}

export default Observatories;