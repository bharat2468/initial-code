import { apiconnector} from "../apiConnector";
export function gentext(UserInput){
    return async(dispatch)=>{
        try{
            const url =`${process.env.CORS_PROXY}https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct`
            const bodyData = {
                messages: [
                  { role: "system", content: "You are a friendly assistant" },
                  { role: "user", content: UserInput }
                ]
              };
            const headers = {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_AUTH_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              };
            const response = await apiconnector("POST",url,bodyData,headers);
            return response.data;
        }catch(error){
            console.log("GEN TEXT ERROR",error);
        }
    }
}
