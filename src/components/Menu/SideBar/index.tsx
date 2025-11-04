export function SideBar() {
  return (
    <>
      <div className='absolute text-left text-black bg-amber-400 h-full w-48 p-4 md:h-full md:w-64 lg:w-72'>
        <div className='relative top-15'>
          <nav>
            <ul className='flex flex-col gap-4'>
              <li className='hover:bg-amber-300 p-2 rounded'>
                <a href='#home'>Home</a>
              </li>
              <li className='hover:bg-amber-300 p-2 rounded'>
                <a href='#about'>About</a>
              </li>
              <li className='hover:bg-amber-300 p-2 rounded'>
                <a href='#services'>Services</a>
              </li>
              <li className='hover:bg-amber-300 p-2 rounded'>
                <a href='#contact'>Contact</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
