
         {/* Header avec ROAR Sound et INFO */}
export default function Navbar(){
return( 

         <div className="flex flex-col md:flex-row md:justify-between md:items-center ">
         <div className="flex justify-end md:order-2  ">
           <h2 onClick={() => window.location.href = "/About"} className="font-HelveticaNeue font-[950] text-3xl md:text-4xl md:mt-3 ">Info</h2>
         </div>
         <h1 onClick={() => window.location.href = "/Home"} className="ml-0 font-HelveticaNeue text-4xl md:text-4xl md:order-1 md:mt-3">
         <span className="font-[950]">ROAR</span>  music & sound.
</h1>       </div>
)
}