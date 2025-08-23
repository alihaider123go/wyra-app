import { checkUserOnlineStatus } from '@/actions/common'
import React from 'react'

function UserOnlineStatus({ userId }: any) {
    return (
        <>
            {
                checkUserOnlineStatus(userId) &&
                <div className="absolute h-3 w-3 rounded-full bg-green-500 bottom-[4px] right-0"></div>

            }
        </>
    )
}

export default UserOnlineStatus