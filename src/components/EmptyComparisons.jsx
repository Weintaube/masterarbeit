import { useEffect } from "react";


function EmptyComparisons(){




    useEffect(()=>{
        fetchData();
    },[]);

    const fetchData = async()=>{

        try{
            //const response = await fetch(`https://orkg.org/api/comparisons/R12251`); //comparison
            //const response = await fetch(`https://orkg.org/api/statements/subject/R12221`); // first contribution of comparison
            const response = await fetch(`https://orkg.org/api/contributions/R36117`); // first contribution of comparison
            
            //R12227, R12248, R36116
            if(response.ok){
                const result = await response.json();
                console.log(result);

            }

        }catch(error){

        }
    }


}

export default EmptyComparisons;