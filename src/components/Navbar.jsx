
         {/* Header avec ROAR Sound et INFO */}
export default function Navbar(){
return( 

         <div className="flex flex-col md:flex-row md:justify-between md:items-center">
         <div className="flex justify-end md:order-2  ">
           <h2 onClick={() => window.location.href = "/About"} className="source-sans-light  text-3xl md:text-4xl  ">INFO</h2>
         </div>
         <h1 onClick={() => window.location.href = "/Home"} className="ml-0  source-sans-light  text-4xl  md:text-4xl md:order-1">ROAR Sound</h1>
       </div>
)
}